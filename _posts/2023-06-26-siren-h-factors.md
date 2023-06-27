---
title: Siren H-Factors
excerpt: Examining Siren's hypertext features
---

Let's explore [Siren](https://github.com/kevinswiber/siren)'s [H-Factors](http://amundsen.com/hypermedia/hfactor/), a set of hypermedia features measuring the sophistication of a hypertext format. In doing so, we'll see how Siren's hypertext elements are translated to HTTP requests.

I assume you have a basic understanding of [hypertext](https://en.wikipedia.org/wiki/Hypertext), as well as Siren and it's elements. If you're new to Siren, I recommend reading [the specification](https://github.com/kevinswiber/siren/blob/master/README.md).

## Link Support

In Siren, link support is achieved through the use of [links](https://github.com/kevinswiber/siren#links-1), [embedded links](https://github.com/kevinswiber/siren#embedded-link), and [actions](https://github.com/kevinswiber/siren#actions-1). These elements communicate different types of HTTP requests available to a client from a given entity.

### Outbound Links

[Link objects](https://github.com/kevinswiber/siren#links-1) act as [outbound links](http://amundsen.com/hypermedia/hfactor/#lo). To **follow** a link, a client makes an HTTP `GET` request using the `href` as the [request target](https://www.rfc-editor.org/rfc/rfc9110.html#name-messages). For example, suppose we have the following link:

```json
{
  "rel": ["https://schema.org/author"],
  "href": "https://api.example.com/author"
}
```

A client would follow the link by generating this request:

```http
GET https://api.example.com/author HTTP/1.1
```

When the `href` is relative, consider resolving the reference as outlined [here](https://siren-js.github.io/best-practices/#resolve-relative-uris).

Because they are navigational in nature, links can point to any related resource. Therefore it's not safe to assume the response to following a link includes Siren content.

### Embedded Links

[Embedded links](http://amundsen.com/hypermedia/hfactor/#le) are supported via the aptly named [embedded link object](https://github.com/kevinswiber/siren#embedded-link), which "communicate a relationship between entities" [[Siren](https://github.com/kevinswiber/siren#sub-entities-vs-links)]. Unlike link objects, embedded links only point to other entities. Therefore we can't embed other documents (images, PDFs, etc.) in an entity like we can in other hypertext formats such as HTML.

A client can **resolve** an embedded link to an [embedded entity](https://github.com/kevinswiber/siren/blob/master/README.md#embedded-representation) by making an HTTP `GET` request using the `href` as the target. The embedded link in the context entity is then replaced with the response content plus the `rel` property from the embedded link.

As an example, consider the following entity located at `https://api.example.com/books/the-way-of-zen`:

```json
{
  "class": ["Book"],
  "entities": [{ "rel": ["author"], "href": "/people/alan-watts" }],
  "links": [{ "rel": ["self"], "href": "/books/the-way-of-zen" }]
}
```

To resolve the `author` sub-entity, a client makes the following request:

```http
GET /people/alan-watts HTTP/1.1
Host: api.example.com
```

```http
HTTP/1.1 200 OK
Content-Type: application/vnd.siren+json

{
  "class": ["Person"],
  "links": [
    { "rel": ["self"], "href": "/people/alan-watts" }
	]
}
```

The client then adds the `rel` property to the content and replaces the embedded link with the result.

```json
{
  "class": ["Book"],
  "entities": [
    {
      "rel": ["author"],
      "class": ["Person"],
      "links": [{ "rel": ["self"], "href": "/people/alan-watts" }]
    }
  ],
  "links": [{ "rel": ["self"], "href": "/books/the-way-of-zen" }]
}
```

### Templated Queries

An [action](https://github.com/kevinswiber/siren#actions-1) whose `method` is `GET` represents a [templated query](http://amundsen.com/hypermedia/hfactor/#lt). A client **submits** this type of action by making an HTTP `GET` request, using the `href` as the [request target](https://www.rfc-editor.org/rfc/rfc9110.html#name-messages). The `fields` are [serialized as a URL-encoded form](https://url.spec.whatwg.org/#urlencoded-serializing) where the name-value pairs are the `name` and `value` of each [field](https://github.com/kevinswiber/siren#fields-1). The result is used as the request URI's [query](https://www.rfc-editor.org/rfc/rfc3986#section-3.4).

```json
{
  "title": "Search Orders",
  "name": "search",
  "href": "/orders",
  "fields": [{ "name": "orderNumber" }]
}
```

Given the `search` action above, suppose a value of `foo` is provided for the `orderNumber` field. Submitting the action generates this HTTP request:

```http
GET /orders?orderNumber=foo HTTP/1.1
Host: api.example.com
```

As with [outbound links](https://www.notion.so/Siren-H-Factors-a72892be39d8426bafad38b4d2362eea?pvs=21), it is not safe to assume the response to submitting an action will contain Siren content.

### Non-Idempotent Updates

[Actions](https://github.com/kevinswiber/siren#actions-1) with a non-idempotent HTTP method (e.g., `POST`, `PATCH`) for the `method` property are used for [non-idempotent updates](http://amundsen.com/hypermedia/hfactor/#ln).

```json
{
  "title": "Add Item",
  "name": "add-item",
  "method": "POST",
  "href": "/orders/42/items",
  "fields": [
    { "name": "orderNumber", "type": "hidden", "value": "42" },
    { "name": "productCode", "type": "text" },
    { "name": "quantity", "type": "number", "class": ["integer"] }
  ]
}
```

Given the values `ABC123` and `10` for the `productCode` and `quantity` fields above, submitting the `add-item` action generates this request:

```http
POST /orders/42/items HTTP/1.1
Host: api.example.com
Content-Type: application/x-www-form-urlencoded
Content-Length: 45

orderNumber=42&productCode=ABC123&quantity=10
```

### Idempotent Updates

Lastly in link support, [idempotent updates](http://amundsen.com/hypermedia/hfactor/#li) are represented by [actions](https://github.com/kevinswiber/siren#actions-1) with an [idempotent](https://www.rfc-editor.org/rfc/rfc9110.html#name-idempotent-methods) `method` (e.g., `PUT`, `DELETE`). If the HTTP method doesn't support request content (i.e., `DELETE`), `fields` are [serialized as a URL-encoded form](https://url.spec.whatwg.org/#urlencoded-serializing) into the request URI's [query](https://www.rfc-editor.org/rfc/rfc3986#section-3.4), similar to a [templated query](https://www.notion.so/Siren-H-Factors-a72892be39d8426bafad38b4d2362eea?pvs=21). Otherwise, `fields` are serialized into the request body.

```json
{
  "title": "Remove Order",
  "name": "remove",
  "method": "DELETE",
  "href": "/orders/42",
  "fields": [{ "name": "archive", "type": "checkbox" }]
}
```

```http
DELETE /orders/42?archive=false HTTP/1.1
Host: api.example.com
```

## Control Data

Certain properties of the link-supporting objects provide support for control data.

### Control Data for Links

The [link](https://github.com/kevinswiber/siren#links-1)'s and [embedded link](https://github.com/kevinswiber/siren#embedded-link)'s `rel` property allows specifying the [relation type](http://www.iana.org/assignments/link-relations/link-relations.xhtml) to the target resource.

### Control Data for Interface Methods

The [action](https://github.com/kevinswiber/siren#actions-1)'s `method` property specifies the HTTP method to use when submitting an action, which is what allows Siren to support [Templated Queries](https://www.notion.so/Siren-H-Factors-a72892be39d8426bafad38b4d2362eea?pvs=21), [Non-Idempotent Updates](https://www.notion.so/Siren-H-Factors-a72892be39d8426bafad38b4d2362eea?pvs=21), and [Idempotent Updates](https://www.notion.so/Siren-H-Factors-a72892be39d8426bafad38b4d2362eea?pvs=21).

### Control Data for Read Requests

The [link](https://github.com/kevinswiber/siren#links-1)'s `type` property "defines [the] media type of the linked resource, per [Web Linking (RFC5988)](http://tools.ietf.org/html/rfc5988)". However, according to [RFC 8288](https://www.rfc-editor.org/rfc/rfc8288.html), which obsoletes RFC 5988, "the `type` attribute, when present, is only a hint; for example, it does not override the `Content-Type` header field of a HTTP response obtained by actually following the link." Therefore the `type` attribute has no effect on HTTP messages.

Since [embedded links](https://github.com/kevinswiber/siren#embedded-link) only point to other entities, their `type` property is irrelevant.

### Control Data for Update Requests

Finally, the [action](https://github.com/kevinswiber/siren#actions-1)'s `type` property indicates to clients how the action's `fields` are to be serialized. We saw how to serialize `application/x-www-form-urlencoded` actions above. Now let's see how we might serialize a `multipart/form-data` action. Consider the following `add-invoice` action:

```json
{
  "title": "Upload Invoice",
  "name": "add-invoice",
  "method": "PUT",
  "href": "/orders/42/invoice",
  "type": "multipart/form-data",
  "fields": [
    { "name": "orderNumber", "type": "hidden", "value": "42" },
    { "name": "invoice", "type": "file" }
  ]
}
```

Following the rules outlined in [RFC 7578](https://www.rfc-editor.org/rfc/rfc7578.html), a client would generate the following request when submitting the action, assuming a file named `invoice.pdf` is provided for the `invoice` field:

```http
PUT /orders/42/invoice HTTP/1.1
Host: example.com
Content-Type: multipart/form-data; boundary=foobar

--foobar
Content-Disposition: form-data; name="orderNumber"

42
--foobar
Content-Disposition: form-data; name="invoice"; filename="invoice.pdf"
Content-Type: application/pdf
Content-Length: 69420

...file bytes...
--foobar--
```

## Summary

Siren supports nearly every H-factor. Erring on the side of caution, the only factor not supported is [control data for read requests](https://www.notion.so/Siren-H-Factors-a72892be39d8426bafad38b4d2362eea?pvs=21).

![Siren H-Factors](/assets/img/siren-h-factors.svg)

Compared to [other hypertext formats' H-factors](https://gtramontina.com/h-factors/), like HAL or Collection+JSON, Siren's hypermedia support is quite robust. With Siren we can provide nearly every protocol detail a web API needs at runtime.
