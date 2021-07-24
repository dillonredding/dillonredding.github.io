---
title: Communicating Resource Creation
tags: [api, http, status codes]
---

After [my last post][1], I thought I'd make another about HTTP etiquette, this time regarding a common misunderstanding of the [`201 (Created)`][2] status code. This one can be a bit tricky because, while you might be using the status code itself correctly, there are other parts of the message that have implications you might not be aware of.

[1]: ../_posts/2021-06-28-the-empty-search-result-anti-pattern.md
[2]: https://datatracker.ietf.org/doc/html/rfc7231#section-6.3.2

The way I see `201` used most is in response to a `POST` request for appending an item to a collection. Something like this:

```http
POST /books HTTP/1.1
Host: example.com
Content-Type: application/json
Content-Length: 165

{
  "title": "RESTful Web APIs",
  "authors": "Mike Amundsen, Sam Ruby, Leonard Richardson",
  "publishers": "O'Reilly Media, Inc.",
  "isbn": "9781449358068"
}
```

We have a collection at `/books` and we want to add a book to it. The typical response is usually pretty simple:

```http
HTTP/1.1 201 Created
Content-Type: application/json
Content-Length: 180

{
  "id": 1234,
  "title": "RESTful Web APIs",
  "authors": "Mike Amundsen, Sam Ruby, Leonard Richardson",
  "publishers": "O'Reilly Media, Inc.",
  "isbn": "9781449358068"
}
```

In the response, we usually get some sort of generated identifier in the representation (`id`) along with the `201`. This has nothing to do with HTTP, but what our server is typically trying to communicate is that there's a new resource at `/books/1234`, however this approach creates some issues.

First, it requires clients to understand the server's URL design strategy. They have to know to take the value of `id` and append that to `/books/`. This creates some tight coupling because we know that [URLs are opaque][3] and thus an implementation detail of the server.

[3]: https://www.w3.org/DesignIssues/Axioms.html#opaque

Second, and more to the point of this post, is a problem at the protocol level, a missing piece in the response message. To get a better understanding of this, let's look at the definition of the `201` status code from [the HTTP standard][4]:

[4]: https://datatracker.ietf.org/doc/html/rfc7231

> The `201 (Created)` status code indicates that the request has been fulfilled
> and has resulted in one or more new resources being created. The primary
> resource created by the request is identified by either a `Location` header
> field in the response or, if no `Location` field is received, by the effective
> request URI.

Since our response above is missing a [`Location`][5] header, what our server is _really_ saying is that a new resource was created at `/books`. Clearly, that's not the case. That's our collection, which already existed. So, a more appropriate response would look as follows:

[5]: https://datatracker.ietf.org/doc/html/rfc7231#section-7.1.2

```http
HTTP/1.1 201 Created
Location: /books/9781449358068
```

This says that in response to our request a new resource was created at `http://example.com/books/9781449358068`. We could have sent back the absolute URL, but `Location` is defined as a [URI reference][6]. The HTTP standard states that when the `Locations` is a [relative reference][7], it's [resolved][8] against the [effective request URI][9]: `http://example.com/books`.

[6]: https://datatracker.ietf.org/doc/html/rfc3986#section-4.1
[7]: https://datatracker.ietf.org/doc/html/rfc3986#section-4.2
[8]: https://datatracker.ietf.org/doc/html/rfc3986#section-5
[9]: https://datatracker.ietf.org/doc/html/rfc7230#section-5.5

We also could have included the representation in the response, but now that the client has the URL of the new resource, they don't need the identifier, and since that's all we added to the representation in the response, the client doesn't need it, and we same some network bandwidth in the process. Furthermore, we loosen the coupling by reducing the clients' need to understand the server's URLs.

## `201` without a `Location`

We saw that not including a `Location` is technically valid, but when would we want to do that? One reason would be to give clients control over the URI, but why would we want to do that? Perhaps we don't want to generate a URL for each resource.

Going back to our book example, suppose we want to allow clients to create resources that represent wishlists of books found at `/wishlists/{id}`, but instead of the server generating a value for `id`, we let the clients choose it.

You're probably familiar with using `PUT` to update resources, but according to the HTTP standard ([RFC 7231][10]), a `PUT` request asks that "the target resource be _created_ or replaced [emphasis mine]". It goes on to say that "if the target resource _does not_ have a current representation and the `PUT` _successfully creates one_, then the origin server MUST inform the user agent by sending a `201 (Created)` response." So, if a resource doesn't exist at particular URL, a `PUT` can be used to create it (assuming the server allows it).

[10]: https://datatracker.ietf.org/doc/html/rfc7231#section-4.3.4

So, a request to create a wishlist might look something like the following:

```http
PUT /wishlists/classics HTTP/1.1
Host: example.com
Content-Type: text/uri-list
Content-Length: 118

http://example.com/books/9780141439518
http://example.com/books/9781443434973
http://example.com/books/9780743273565
```

Assuming the resource at `/wishlists/classics` doesn't have a representation (i.e., exist), the server creates it and informs the client:

```http
HTTP/1.1 201 Created
```

With no `Location` header, this response says the resource was successfully created at the [effective request URI][9]: `http://example.com/wishlists/classics`.

Additionally, our server could allow similar requests to _update_ the resource after it's created. For `PUT` requests, "if the target resource _does_ have a current representation and that representation is successfully modified [...], then the origin server MUST send either a `200 (OK)` or a `204 (No Content)` response" (RFC 7231).

## Summary

When accepting `POST` to create and append an item to a collection, respond with a `201` and include a `Location` header. If you can't include a `Location` header (or simply don't want to), just use a `200 (OK)`. There's no value in falsely reporting the creation of a resource that already existed.

Alternatively, use `PUT` to create your resources, in which case don't worry about sending a `Location` header at all.

Have you seen this
