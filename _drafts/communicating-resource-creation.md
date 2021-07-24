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

It has nothing to do with HTTP, but we usually get back some sort of identifier in the representation (`id`) along with the `201`. The thing our server is trying to communicate in this case is that there's a new resource at `/books/1234`, however this approach creates some issues. I won't go into all of the issues in this post (maybe in later posts 🤞🏻), I just want to focus on the one at the protocol level. To get a better understanding of the issue, let's look at the definition of the `201` status code from [RFC 7231][3]:

[3]: https://datatracker.ietf.org/doc/html/rfc7231

> The `201 (Created)` status code indicates that the request has been fulfilled
> and has resulted in one or more new resources being created. The primary
> resource created by the request is identified by either a `Location` header
> field in the response or, if no `Location` field is received, by the effective
> request URI.

Since our response above is missing a [`Location`][4] header, our server is _really_ saying that a new resource was created at `/books`. Clearly, that's not the case, that's our collection, which already existed. So, a more appropriate response would look as follows:

[4]: https://datatracker.ietf.org/doc/html/rfc7231#section-7.1.2

```http
HTTP/1.1 201 Created
Location: /books/9781449358068
```

This says that in response to our request a new resource was created at `/books/9781449358068`. We could have used an absolute URL, but since the `Location` is a [relative reference][5], it's resolved against the [effective request URI][6]: `http://example.com/books`, meaning the absolute URL of the new resource is `http://example.com/books/9781449358068`.

[5]: https://datatracker.ietf.org/doc/html/rfc3986#section-4.2
[6]: https://datatracker.ietf.org/doc/html/rfc7230#section-5.5

We also could have included the representation in the response, but now that the client has the URL of the new resource, they don't need the identifier. Since all we added to the representation in the response was the `id`, the client doesn't need the representation and we save network bandwidth in the process.

## `201` without a `Location`

We saw that not including a `Location` is technically valid, but when would we want to do that? One reason might be to give clients control over the URI.

"Why would we want to do that," you might ask? Perhaps we don't want to generate a URL for each resource. Going back to our book example, suppose we want to allow clients to create resources that represent wishlists of books found at `/wishlists/{id}`, but instead of the server generating a value for `id`, we let the clients choose it.

"Okay, cool, but how do we do that?" I'm glad you asked! You're probably familiar with using `PUT` to update resources, but according to [RFC 7231][7], a `PUT` request asks that "the target resource be *created or replaced* [emphasis mine]". It goes on to say that "if the target resource does not have a current representation and the `PUT` successfully creates one, then the origin server MUST inform the user agent by sending a `201 (Created)` response." So, if a resource doesn't exist at particular URL, a `PUT` could be used to create it (if the server allows it).

[7]: https://datatracker.ietf.org/doc/html/rfc7231#section-4.3.4

Tying our why and how together, our request might look like the following:

```http
PUT /wishlists/classics HTTP/1.1
Host: example.com
Content-Type: text/uri-list
Content-Length: 118

http://example.com/books/9780141439518
http://example.com/books/9781443434973
http://example.com/books/9780743273565
```

Assuming `/wishlists/classics` doesn't exist, we create it:

```http
HTTP/1.1 201 Created
```

This means the resource was successfully created at the [effective request URI][6]: `http://example.com/wishlists/classics`.

Our server could allow the same request to update the resource, if it already exists. For `PUT` requests, RFC 7231 states that "if the target resource does have a current representation and that representation is successfully modified [...], then the origin server MUST send either a `200 (OK)` or a `204 (No Content)` response".

## Summary

When accepting `POST` to create and append an item to a collection, respond with a `201` and include a `Location` header. If you can't include a `Location` header (or simply don't want to), just use a `200 (OK)`. You're not providing value to anyone by falsely reporting that a resource was created when it already existed. Alternatively, use `PUT` to create your resources.

When using `PUT` to create resources, don't worry about the `Location` header.
