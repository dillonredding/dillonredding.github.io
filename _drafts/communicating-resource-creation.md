---
title: Communicating Resource Creation
tags: [api, http, status codes]
---

After [my last post][1], I thought I'd make another about HTTP etiquette, this time regarding a common misunderstanding of the [`201 (Created)`][2] status code. This one can be a bit tricky because, while you might be using the status code itself correctly, there are other parts of the message that have implications you might not be aware of.

[1]: ../_posts/2021-06-28-the-empty-search-result-anti-pattern.md
[2]: https://datatracker.ietf.org/doc/html/rfc7231#section-6.3.2

To understand the `201` status code better, let's look at the definition from RFC 7231:

> The `201 (Created)` status code indicates that the request has been fulfilled
> and has resulted in one or more new resources being created. The primary
> resource created by the request is identified by either a `Location` header
> field in the response or, if no `Location` field is received, by the effective
> request URI.

Note that we're talking about creating an [*HTTP resource*][3], meaning a new URI is available to clients as a result of processing a request. Our resource may or may not correspond to creating something on the server side such as inserting one or more rows into one or more tables in one or more databases, saving a file locally or remotely, or simply storing data in memory. Regardless, whatever is behind the resource doesn't matter at the protocol level. We're focused on URI-addressable resources.

[3]: https://datatracker.ietf.org/doc/html/rfc7231#section-2

Speaking of, let's now breakdown the part about the `Location` header. If we include a [`Location`][4] header, whose value is a URI, then we're saying the newly created resource can be found at that URI. However, if we don't include a `Location` header, we're saying the new resource can be found at the [effective request URI][5], which is the absolute URI of the request.

[4]: https://datatracker.ietf.org/doc/html/rfc7231#section-7.1.2
[5]: https://datatracker.ietf.org/doc/html/rfc7230#section-5.5

Let's consider each case individually.

## `201` with a `Location`

Probably the most common way to create new resource is with a `POST` request.

Suppose we have a server with a contact list resource at `/contacts`. We'll assume we can make a `GET` request for `/contacts` to see the entire contact list.

If a client wants to create a new contact, they can make a `POST` request on the contact list resource. For example:

```http
POST /contacts HTTP/1.1
Host: example.com
Content-Type: text/vcard
Content-Length: 125

BEGIN:VCARD
VERSION:4.0
FN:Ronald Bilius Weasley
NICKNAME:Ron
BDAY:19800301
EMAIL:ronald.weasley@hogwarts.edu
END:VCARD
```

Here, the client is using [vCard][6] to represent an individual, but the details don't matter for our purposes. If all goes well on the server side, we respond with a `201`, including the URI of the new contact resource:

[6]: https://datatracker.ietf.org/doc/html/rfc6350

```http
HTTP/1.1 201 Created
Location: /contacts/7ed4b35e-4ee7-4552-af7e-1a6a4a2c29c9
```

Without the `Location` header, our response would be saying we created a resource `/contacts`, but that resource already exists, so the `Location` header is required here.

There is, however, a case where we don't need a `Location` header.

## `201` without a `Location`

You're probably familiar with using `PUT` requests to update resources, but did you know it can be used to created resource as well? Here's the [definition of `PUT`][7]:

[7]: https://datatracker.ietf.org/doc/html/rfc7231#section-4.3.4

> The `PUT` method requests that the state of the target resource be created or
> replaced with the state defined by the representation enclosed in the request
> message payload.

RFC 7231 goes on to state:

> If the target resource does not have a current representation and the `PUT`
> successfully creates one, then the origin server MUST inform the user agent by
> sending a `201 (Created)` response.

Essentially, what that means is, if a `PUT` request creates resource, the client effectively controls that resources URI. For example:

```http
PUT /contacts/7ed4b35e/best-friends HTTP/1.1
Content-Type: text/uri-list
Content-Length: 42

# Harry
/contacts/00c747fd
# Hermione
/contacts/59f3757e
```

[69]: https://datatracker.ietf.org/doc/html/rfc2483#section-5

```http
HTTP/1.1 201 Created
```

## Creating Multiple Resources

<!-- TODO -->

## Conclusion
