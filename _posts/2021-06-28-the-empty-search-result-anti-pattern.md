---
title: The Empty Search Result Anti-Pattern
tags: [api, http, status codes]
---

I saw [this post on Twitter][1] the other day and thought it would make for a good first blog post since I've seen the exact same question where I used to work.

[1]: https://twitter.com/apihandyman/status/1397638739128733696

The question centers around this idea of the "empty search result." That is, we have a resource representing a collection of other resources (items) and we want to find items matching one or more criterion. The question then is: what should our response's status code be if no items match our criteria? We're usually faced with three options: `200 (OK)`, `204 (No Content)`, and `404 (Not Found)`.

It's easy to take [HTTP status codes][2] at face value and use them without understanding the semantics at the protocol level. I get it. I've done it. RFCs aren't exactly easy reads. However, ignoring and redefining message components reduces interoperability of our server with other components in the network. So, rather than [bike-shed][3] about the "best" option, I'll fall back on standards written by people much smarter than me, primarily [RFC 7231][4].

[2]: https://www.iana.org/assignments/http-status-codes
[3]: https://en.wikipedia.org/wiki/Law_of_triviality
[4]: https://datatracker.ietf.org/doc/html/rfc7231

## Disclaimer

Before diving in, I want to make a brief disclaimer: it's not clear in the post whether our [target resource][5] `/users?name=spock` is a filtered collection or a single item. This is *very* important in determining the correct status code, so I'll be considering both cases.

[5]: https://datatracker.ietf.org/doc/html/rfc7231#section-2

You might see `/users?name=spock` and think something along these lines: "Obviously that's a filtered collection. The item URL would be `/users/spock`." Well, hang on there. There's no requirement for how we *structure* our URLs in either [RFC 3986][6] or [RFC 7230][7]. The typical `/collection` and `/collection/{id}` URL patterns are just widely adopted conventions. For all HTTP is concerned, the item URL instead could be `/user/spock`, `/u/spock`, or even `/dXNlci9zcG9jaw==`. The URL doesn't matter as long as we can map it to a unique [resource][5] on the origin server.

[6]: https://datatracker.ietf.org/doc/html/rfc3986
[7]: https://datatracker.ietf.org/doc/html/rfc7230#section-2.7.1

The *meaning* we assign to URLs is irrelevant to everyone but the origin server. The point is that a URL is merely an identifier. We should not try to grok additional information from it's contents. This is known as [The Opacity Axiom][8].

[8]: https://www.w3.org/DesignIssues/Axioms.html#opaque

## The Options

So, back to our question: `200`, `204`, or `404`?

### Option 1: `200`

Let's start by looking at the definition of `200` from [RFC 7231][9]:

[9]: https://datatracker.ietf.org/doc/html/rfc7231#section-6.3.1

> The `200 (OK)` status code indicates that the request has succeeded. The payload
> sent in a `200` response depends on the request method.

That's unsurprisingly generic, but we see that whatever our payload is depends on the [request method][10]. We're using [`GET`][11], so our response payload will be "a [representation][12] of the [target resource][5]".

[10]: https://www.iana.org/assignments/http-methods
[11]: https://datatracker.ietf.org/doc/html/rfc7231#section-4.3.1
[12]: https://datatracker.ietf.org/doc/html/rfc7231#section-3

Let's first suppose `/users?name=spock` is our filtered collection. Since a user by that name doesn't exist, our representation should be an empty collection. There are several [media types][13] we could use to represent this. In [JSON][14], we might have something like this:

[13]: https://www.iana.org/assignments/media-types
[14]: https://datatracker.ietf.org/doc/html/rfc8259

```http
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 19

{
  "users": []
}
```

We could leave off the outer object and simply use the empty array, but I think this better communicates what values the array is meant to hold.

Since we seem to be following the collection pattern&mdash;CRUD operations on a set of related resources&mdash;we could use [Collection+JSON][15], in which case our representation might look something like this:

[15]: http://amundsen.com/media-types/collection/

```http
HTTP/1.1 200 OK
Content-Type: application/vnd.collection+json
Content-Length: 328

{
  "collection": {
    "version": "1.0",
    "href": "http://example.org/users?name=spock",
    "items": [],
    "queries": [
      {
        "rel": "search",
        "href": "http://example.org/users",
        "prompt": "Search by Name",
        "data": [{ "name": "name", "value": "spock" }]
      }
    ]
  }
}
```

Note the empty array at `/collection/items` (see [JSON Pointer][16]). We get a lot more information here than with plain JSON such as the URL of the resource we're representing (`/collection/href`) and a [query object][17] (`/collection/queries/0`) describing [how we can search][18].

[16]: https://datatracker.ietf.org/doc/html/rfc6901
[17]: http://amundsen.com/media-types/collection/format/#arrays-queries
[18]: http://amundsen.com/media-types/collection/format/#query-templates

Or maybe we want to use something simpler like [CSV][28]:

[28]: https://datatracker.ietf.org/doc/html/rfc4180

```http
HTTP/1.1 200 OK
Content-Type: text/csv;header=present
Content-Length: 36

givenName,familyName,email,telephone
```

Even [HTML][19] has ways to represent an empty collection, with an empty `ol` or `ul` element:

[19]: https://html.spec.whatwg.org/multipage

```http
HTTP/1.1 200 OK
Content-Type: text/html
Content-Length: 147

<!DOCTYPE html>
<html>
  <body>
    <ol></ol>
    <p>No items found with <code>name</code> matching <code>spock</code>.</p>
  </body>
</html>
```

Since the `ol` element is empty, I added a `p` element to describe the situation and avoid cases where this is viewed in a browser and the page is blank. For APIs, this very likely won't be displayed in a browser&mdash;and I'm not recommending anyone use HTML in their APIs, at least as the *primary* representation format&mdash;I just want to be sure the representation is *useful*.

Maybe you're a fan of [XML][20], for which we could simply use an empty element:

[20]: https://datatracker.ietf.org/doc/html/rfc7303

```http
HTTP/1.1 200 OK
Content-Type: application/xml
Content-Length: 32

<?xml version="1.0"?>
<users />
```

Without an [XSD][21] though, the XML document lacks [type information][22]. Depending on the context, it *may* not be immediately obvious that the `users` element is supposed to represent an empty collection, but I don't see this being a hang up for most people.

[21]: https://www.w3.org/XML/Schema
[22]: https://en.wikipedia.org/wiki/Data_type

If we want to be really lazy, we could just use plain text, borrowing the description from our HTML example:

```http
HTTP/1.1 200 OK
Content-Type: text/plain
Content-Length: 42

No items found with name matching 'spock'.
```

There are definitely other media types we could use, but I think that's plenty of examples showing how we could represent our empty collection. The point is we have options. Thus a `200` seems rather promising, but let's consider the other two status codes for the sake of argument.

Before moving on, however, let's quickly consider the case where `/users?name=spock` is a single user. Recall that the user doesn't exist, therefore the resource doesn't exist and we cannot represent it, and so `200` is inappropriate.

### Option 2: `204`

Now for `204`. In the context of our "empty search result", I believe most people use this status code to communicate that the search was successful, but no items matched the given criteria. Well, let's hit up [RFC 7231][23] for the definition:

[23]: https://datatracker.ietf.org/doc/html/rfc7231#section-6.3.5

> The `204 (No Content)` status code indicates that the server has successfully
> fulfilled the request and that there is no additional content to send in the
> response payload body.

In response to a `GET` request, a `204` would appear to imply that we can't represent the target resource. So, not quite the same thing.

If `/users?name=spock` is our filtered collection, then a `204` would mean we have no representation, but as we saw in [option 1](#option-1-200), that's just not true. That would also mean we likely can't even represent a non-empty collection, in which case, this resource isn't very useful. So, `204` doesn't work for us here.

On the other hand, if `/users?name=spock` is an item, then a `204` response means we can't even represent a user, making this resource absolutely useless. Thus `204` isn't appropriate in either case and is therefore an anti-pattern when used in response to searching a collection.

### Option 3: `404`

Finally, the `404`. Again, let's start with the definition from [RFC 7231][24]:

[24]: https://datatracker.ietf.org/doc/html/rfc7231#section-6.5.4

> The `404 (Not Found)` status code indicates that the origin server did not
> find a current representation for the target resource or is not willing to
> disclose that one exists.

We'll ignore the latter half since that's more of a security thing, but the former half implies we can't represent the target resource. Sound familiar? That's the same as [the `204` option](#option-2-204) with the added caveat that this is somehow the *client's problem*.

In the case of `/users?name=spock` being the filtered collection, it's the same argument as the `204`. However, in the case of `404`, the definition states that "the origin server did not **find** a current representation". While we definitely have options for a representation, that doesn't mean the server is aware of or understands those options. With that, a `404` *technically* could be valid&mdash;depending on our definition of "find"&mdash;but this scenario is likely rare since a server ignorant of the representation options probably isn't worth calling.

You might be asking yourself, "If `/users` is our collection and it exists, then `/users?name=spock` would exist too, right? Does the query string matter here?" Absolutely! The [RFC 3986][6] defines the [query][26] component as "non-hierarchical data that, along with data in the path component ([Section 3.3][27]), **serves to identify a resource**... [emphasis mine]."

[26]: https://datatracker.ietf.org/doc/html/rfc3986#section-3.4
[27]: https://datatracker.ietf.org/doc/html/rfc3986#section-3.3

For the case of `/users?name=spock` being a single user, a `404` is perfect. The user doesn't exist, hence the resource doesn't exist, and thus there is no way to represent it.

I believe some people take this status code too literally. In the collection pattern, when a request is received, the server likely queries a table in a database with the given criteria and finds nothing. That is, the items are *not found*, so naturally the response status should be `404`, right? Not exactly. HTTP doesn't care about the server's underlying architecture.

## Conclusion

TL;DR: Go with `200`, if `/users?name=spock` is a collection, and `404`, if it's an item.

The issues I see with options [2](#option-2-204) and [3](#option-3-404) really boil down to mixing semantics. That is, the protocol is used (and abused) to communicate application or domain semantics. HTTP doesn't care about things like "collections" or "search results". It doesn't care about the architecture behind the various components. It cares about resources and messages. We can still communicate our application semantics while respecting the protocol, being careful to [separate those concerns][28].

[28]: https://en.wikipedia.org/wiki/Separation_of_concerns

Thanks for reading! Feel free to hit me up on Twitter [@dillon_redding][29] with questions or comments.

[29]: https://twitter.com/dillon_redding
