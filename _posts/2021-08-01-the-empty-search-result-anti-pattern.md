---
title: The Empty Search Result Anti-Pattern
excerpt: Use the correct status code when searching for things in your API
tags: api http pattern
---

I saw [this poll on Twitter](https://twitter.com/apihandyman/status/1397638739128733696) the other day and thought it would make for a good first blog post since I've seen the exact same question where I used to work and there's no clear consensus about what is "correct" or "proper".

The question centers around this idea of the "empty search result." That is, we have a resource representing a collection of other resources (items) and we want to find items matching one or more criterion. The question then is: what should our response's status code be if no items match our criteria? We're usually faced with three options: `200 (OK)`, `204 (No Content)`, and `404 (Not Found)`.

It's easy to take [HTTP status codes](https://www.iana.org/assignments/http-status-codes) at face value and use them without understanding the semantics at the protocol level. I get it. I've done it. RFCs aren't exactly easy reads. However, ignoring and redefining message components reduces interoperability of our server with other components in the network. So, rather than [bike-shed](https://en.wikipedia.org/wiki/Law_of_triviality) about the "best" option, I'll fall back on standards written by people much smarter than me, primarily [RFC 7231](https://datatracker.ietf.org/doc/html/rfc7231).

## Disclaimer

Before diving in, I want to make a brief disclaimer: it's not clear in the post whether our [target resource](https://datatracker.ietf.org/doc/html/rfc7231#section-2) `/users?name=spock` is a filtered collection or a single item. This is _very_ important in determining the correct status code, so I'll be considering both cases.

You might see `/users?name=spock` and think something along these lines: "Obviously that's a filtered collection. The item URL would be `/users/spock`." Well, hang on there. There's no requirement for how we structure our URLs in either [RFC 3986](https://datatracker.ietf.org/doc/html/rfc3986) or [RFC 7230](https://datatracker.ietf.org/doc/html/rfc7230#section-2.7.1). The typical `/collection and /collection/{id}` URL patterns are just widely adopted conventions. For all HTTP is concerned, the item URL instead could be `/user/spock`, `/u/spock`, or even `/dXNlci9zcG9jaw==`. The URL doesn't matter as long as we can map it to a unique [resource](https://datatracker.ietf.org/doc/html/rfc7231#section-2) on the origin server.

The _meaning_ we assign to URLs is irrelevant to everyone but the origin server. The point is that a URL is merely an identifier. We should not try to grok additional information from it's contents. This is known as [The Opacity Axiom](https://www.w3.org/DesignIssues/Axioms.html#opaque).

## The Options

So, back to our question: `200`, `204`, or `404`?

### Option 1: `200`

Let's start by looking at the definition of `200` from [RFC 7231](https://datatracker.ietf.org/doc/html/rfc7231#section-6.3.1):

> The `200 (OK)` status code indicates that the request has succeeded. The payload sent in a `200` response depends on the request method.

That's unsurprisingly generic, but we see that whatever our payload is depends on the [request method](https://www.iana.org/assignments/http-methods). We're using [`GET`](https://datatracker.ietf.org/doc/html/rfc7231#section-4.3.1), so our response payload will be "a [representation](https://datatracker.ietf.org/doc/html/rfc7231#section-3) of the [target resource](https://datatracker.ietf.org/doc/html/rfc7231#section-2)".

Let's first suppose `/users?name=spock` is our filtered collection. Since a user by that name doesn't exist, our representation should be an empty collection. There are several media types we could use to represent this. In [JSON](https://datatracker.ietf.org/doc/html/rfc8259), we might have something like this:

```http
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 19

{
  "users": []
}
```

We could leave off the outer object and simply use the empty array, but I think this better communicates what values the array is meant to hold.

Since we seem to be following the collection pattern—CRUD operations on a set of related resources—we could use [Collection+JSON](http://amundsen.com/media-types/collection/), in which case our representation might look something like this:

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

Note the empty array at `/collection/items` (see [JSON Pointer](https://datatracker.ietf.org/doc/html/rfc6901)). We get a lot more information here than with plain JSON such as the URL of the resource we're representing (`/collection/href`) and a [query object](http://amundsen.com/media-types/collection/format/#arrays-queries) (`/collection/queries/0`) describing [how we can search](http://amundsen.com/media-types/collection/format/#query-templates).

Or maybe we want to use something simpler like [CSV](https://www.rfc-editor.org/rfc/rfc4180):

```http
HTTP/1.1 200 OK
Content-Type: text/csv;header=present
Content-Length: 36

givenName,familyName,email,telephone
```

Even [HTML](https://html.spec.whatwg.org/multipage) has ways to represent an empty collection, with an empty `ol` or `ul` element:

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

Since the `ol` element is empty, I added a `p` element to describe the situation and avoid cases where this is viewed in a browser and the page is blank. For APIs, this very likely won't be displayed in a browser—and I'm not recommending anyone use HTML in their APIs, at least as the _primary_ representation format—I just want to be sure the representation is _useful_.

Maybe you're a fan of [XML](https://datatracker.ietf.org/doc/html/rfc7303), for which we could simply use an empty element:

```http
HTTP/1.1 200 OK
Content-Type: application/xml
Content-Length: 32

<?xml version="1.0"?>
<users />
```

Without an [XSD](https://www.w3.org/XML/Schema) though, the XML document lacks [type information](https://en.wikipedia.org/wiki/Data_type). Depending on the context, it may not be immediately obvious that the `users` element is supposed to represent an empty collection, but I don't see this being a hang up for most people.

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

Now for `204`. In the context of our "empty search result", I believe most people use this status code to communicate that the search was successful, but no items matched the given criteria. Well, let's hit up [RFC 7231](https://datatracker.ietf.org/doc/html/rfc7231#section-6.3.5) for the definition:

> The `204 (No Content)` status code indicates that the server has successfully fulfilled the request and that there is no additional content to send in the response payload body.

In response to a `GET` request, a `204` would appear to imply that we can't represent the target resource. So, not quite the same thing.

If `/users?name=spock` is our filtered collection, then a `204` would mean we have no representation, but as we saw in [option 1](#option-1-200), that's just not true. That would also mean we likely can't even represent a non-empty collection, in which case, this resource isn't very useful. So, `204` doesn't work for us here.

On the other hand, if `/users?name=spock` is an item, then a `204` response means we can't even represent a user, making this resource absolutely useless. Thus `204` isn't appropriate in either case and is therefore an anti-pattern when used in response to searching a collection.

### Option 3: `404`

Finally, the `404`. Again, let's start with the definition from [RFC 7231](https://datatracker.ietf.org/doc/html/rfc7231#section-6.5.4):

> The `404 (Not Found)` status code indicates that the origin server did not find a current representation for the target resource or is not willing to disclose that one exists.

We'll ignore the latter half since that's more of a security thing, but the former half implies we can't represent the target resource. Sound familiar? That's the same as [the `204` option](#option-2-204) with the added caveat that this is somehow the _client's problem_.

In the case of `/users?name=spock` being the filtered collection, it's the same argument as the `204`. However, in the case of `404`, the definition states that "the origin server did not **find** a current representation". While we definitely have options for a representation, that doesn't mean the server is aware of or understands those options. With that, a `404` _technically_ could be valid—depending on our definition of "find"—but this scenario is likely rare since a server ignorant of the representation options probably isn't worth calling.

You might be asking yourself, "If `/users` is our collection and it exists, then `/users?name=spock` would exist too, right? Does the query string matter here?" Absolutely! The [RFC 3986](https://datatracker.ietf.org/doc/html/rfc3986) defines the query component as "non-hierarchical data that, along with data in the path component ([Section 3.3](https://datatracker.ietf.org/doc/html/rfc3986#section-3.3)), **serves to identify a resource**… [emphasis mine]."

For the case of `/users?name=spock` being a single user, a `404` is perfect. The user doesn't exist, hence the resource doesn't exist, and thus there is no way to represent it.

I believe some people take this status code too literally. In the collection pattern, when a request is received, the server likely queries a table in a database with the given criteria and finds nothing. That is, the items are _not found_, so naturally the response status should be `404`, right? Not exactly. HTTP doesn't care about the server's underlying architecture.

## Conclusion

TL;DR: Go with `200`, if `/users?name=spock` is a collection, and `404`, if it's an item.

The issues I see with options [2](#option-2-204) and [3](#option-3-404) really boil down to mixing semantics. That is, the protocol is used (and abused) to communicate application or domain semantics. HTTP doesn't care about things like "collections" or "search results". It doesn't care about the architecture behind the various components. It cares about resources and messages. We can still communicate our application semantics while respecting the protocol, being careful to [separate those concerns](https://en.wikipedia.org/wiki/Separation_of_concerns).

Thanks for reading!
