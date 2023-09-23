---
title: HTTP Upsert Pattern
excerpt: Create and update a resource with a single method
tags: api http pattern
---

It’s very common to use `POST` to create a resource, especially in the collection pattern, but did you know you can also create resources with `PUT`? According to [the HTTP specification](https://www.rfc-editor.org/rfc/rfc9110.html#section-9.3.4-2):

> If the target resource does not have a current representation and the `PUT` successfully creates one, then the origin server MUST inform the user agent by sending a [`201 (Created)`](https://www.rfc-editor.org/rfc/rfc9110.html#status.201) response.

So, if the URL of a `PUT` request doesn't exist, and the request content is valid, then the server is allowed to create a new resource at the given URL. This differs from `POST` in that the server doesn't generate a URL for the new resource. Instead the _client_ controls the URL.

Let's look at an example. Here's a `PUT` request for `http://api.example.com/playlists/best-of-the-90s`:

```http
PUT /playlists/best-of-the-90s HTTP/1.1
Host: api.example.com
Content-Type: ...

...resource representation...
```

If the resource doesn't exist, the server creates it and responds accordingly:

```http
HTTP/1.1 201 Created
```

Unlike using `POST` to create a resource, the response here doesn’t include a `Location` header.

Subsequent `PUT` requests update the resource as usual. The server can respond with a `200 (OK)` and an updated representation. However since `PUT` _replaces_ the resource’s state, the server can respond with a more abbreviated `204 (No Content)`.
