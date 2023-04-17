---
title: HTTP Collection Pattern
summary: See how CRUD operations map to HTTP messages
published_on: 2023-04-16
---

# HTTP Collection Pattern

Performing CRUD operations on a collection of items is a ubiquitous pattern in APIs. In this post, I'll take you through how each operation corresponds to pairs of HTTP request and response [messages](https://www.rfc-editor.org/rfc/rfc9110.html#name-messages).

For APIs utilizing HTTP, the collection pattern consists of two types of resources: a collection and an item. The collection resource represents a sequence of zero or more items and accepts requests to create a new item. An item resource represents an individual element in the collection and accepts requests to update and delete the item.

As for each resource's representation, I'll be leaving that out in order to maintain focus on HTTP. That said, there are several representation formats designed specifically for the collection pattern that are worth checking out, such as [Collection+JSON](http://amundsen.com/media-types/collection/), [JSON+API](https://jsonapi.org/), and [OData](https://www.odata.org/).

## Retrieve the Collection

As with any HTTP resource, to retrieve the collection's representation, we make a `GET` request.

```http
GET /contact-list HTTP/1.1
Host: api.example.com
```

```http
HTTP/1.1 200 OK
Content-Type: ...

...reference to items in the collection...
```

In the example above, our collection is located at `http://api.example.com/contact-list`.

## Create an Item

To add an item to the collection, the client sends a `POST` request to the collection resource with a representation of the item to create.

Here's an example request:

```http
POST /contact-list HTTP/1.1
Host: api.example.com
Content-Type: ...

...item representation...
```

If all goes well (the server understands the media type, the item is valid, etc.), the server responds with a `201 (Created)`, a `Location` header with the URL of the new item resource, and a representation—typically the new item—that references the new resource ([RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html#section-9.3.3-4)).

Here's an example response to the above request:

```http
HTTP/1.1 201 Created
Location: http://api.example.com/contact-list/44
Content-Type: ...

...
```

Sometimes the server receives invalid data, in which case it responds with a `400 (Bad Request)` response.

```http
HTTP/1.1 400 Bad Request
Content-Type: ...

...explanation of the error(s)...
```

## Retrieve an Item

After creating an item, we can retrieve it by making a `GET` request for the URL sent in the response's `Location` header.

```http
GET /contact-list/44 HTTP/1.1
Host: api.example.com
```

The server responds with a `200 (OK)` and a representation of the item.

```http
HTTP/1.1 200 OK
Content-Type: ...

...item representation...
```

## Update an Item

When updating an item, we have two method options in HTTP: `PUT` and `PATCH`. We use `PUT` to _replace_ an item entirely and `PATCH` to partially update an item. A server could support both methods for updating, but it might only support one or the other.

### Replace

The following request shows how we would update an item in our collection using `PUT`. Note that the entire representation needs to be included, not just the parts we want to update.

```http
PUT /contact-list/44 HTTP/1.1
Host: api.example.com
Content-Type: ...

...updated item...
```

The server might respond with a `200 (OK)` and the updated item. However, since `PUT` is [idempotent](https://www.rfc-editor.org/rfc/rfc9110.html#name-idempotent-methods) and completely replaces the item with what was sent in the request, a `204 (No Content)` response is sufficient, as the client already has the updated item.

```http
HTTP/1.1 204 No Content
```

Similar to create, the server will likely validate the data coming in, which could result in a `400 (Bad Request)`. The updated item might also violate a uniqueness constraint or something similar, in which case a `409 (Conflict)` response is sent.

```http
HTTP/1.1 409 Conflict
Content-Type: ...

...explanation of the error(s)...
```

Sending the full representation for each update may be cumbersome or infeasible. HTTP's `PATCH` method aims to remedy this issue.

### Partial Update

Using `PATCH` is similar to `PUT`, except that `PATCH` is not idempotent, and so the server should always respond with a `200 (OK)` and the updated item.

```http
PATCH /contact-list/44 HTTP/1.1
Host: api.example.com
Content-Type: ...

...
```

```http
HTTP/1.1 200 OK
Content-Type: ...

...
```

To avoid ambiguity with partial updates, use a media type designed for `PATCH` like [JSON Patch](https://jsonpatch.com/), [JSON Merge Patch](https://www.rfc-editor.org/rfc/rfc7396.html), or [XML Patch](https://www.rfc-editor.org/rfc/rfc7351.html).

## Delete an Item

Finally, to delete an item, we use the aptly named `DELETE` method on the item resource.

```http
DELETE /contact-list/40 HTTP/1.1
Host: api.example.com
```

The server responds with a `204 (No Content)` indicating that the item was successfully deleted.

```http
HTTP/1.1 204 No Content
```

Subsequent requests for the item result in a `404 (Not Found)` because the item resource no longer exists.

## Summary

| Action                  | HTTP Method  | Target Resource | Response Status              |
| ----------------------- | ------------ | --------------- | ---------------------------- |
| Retrieve the collection | GET          | Collection      | 200 (OK)                     |
| Create an item          | POST         | Collection      | 201 (Created)                |
| Retrieve an item        | GET          | Item            | 200 (OK)                     |
| Update an item          | PUT or PATCH | Item            | 204 (No Content) or 200 (OK) |
| Delete an item          | DELETE       | Item            | 204 (No Content)             |
