---
title: REST APIs ain't RESTful, Part 4
excerpt: Documenting Siren APIs with ALPS
tags: alps api hypermedia profile rest siren
---

Continuing the series on Siren, I'd like to turn our attention to API documentation. There are several approaches to documenting a web API, one of the most popular being [OpenAPI](https://www.openapis.org). Whether written by hand or [generated from implementation code](https://docs.nestjs.com/openapi/introduction), an OpenAPI document can be provided directly to clients, or it can be used to generate [some type of developer portal](https://swagger.io/tools/swagger-ui). However, this strategy—and many like it—exposes [details about an API that Siren intends to hide]({% post_url 2023-07-14-rest-apis-aint-restful-pt-3 %}) at design time. So, instead of using such a minutiae-laden documentation format, I want to present an alternative called [Application-Level Profile Semantics (ALPS)](http://alps.io).

Similar to OpenAPI, ALPS is a format for writing an [application profile](https://www.rfc-editor.org/rfc/rfc6906.html#section-3) for an API. Unlike OpenAPI though, ALPS focuses primarily on application semantics and delegates protocol semantics to the API's resource representations. That is, a hypermedia format such as Siren describes protocol semantics at runtime to drive client-server interactions.

The way ALPS documents an API is through something it calls **descriptors**, which define the names found in an API (e.g., `Person`, `orderDate`, `address`). When paired with a Siren API, the corresponding ALPS document includes descriptors for the entities' class values, names of properties, names of actions and fields, and link relations.

Full coverage of the semantics and features of ALPS is beyond the scope of this post. My goal here is to demonstrate constructing an ALPS document for a Siren API by documenting [the Kanban Board API](https://github.com/siren-js/examples/tree/main/kanban-board) I used in my last post. If you aren't familiar with ALPS, or you'd like to learn more, I recommend reading through [the spec](https://datatracker.ietf.org/doc/html/draft-amundsen-richardson-foster-alps-07) and [best practices](https://github.com/alps-io/best-practices).

## Entity Class Descriptors

Since Siren uses entities to represent resources, we start by defining a `descriptor` for each entity class in the API with a `doc` string describing what the class represents.

```xml
<alps version="1.0">
  <descriptor id="Card" type="semantic">
    <doc>A single work item</doc>
  </descriptor>
  <descriptor id="KanbanBoard" type="semantic">
    <doc>A collection of work items</doc>
  </descriptor>
</alps>
```

In the example above, we have descriptors for the `Card` and `KanbanBoard` entities from our Kanban Board API.

## Property Descriptors

Next, within each class `descriptor`, we specify the names of properties present in the corresponding entity.

Here we define descriptors for the `description` and `stage` properties that appear in a `Card`:

```xml
<descriptor id="Card" type="semantic">
  <doc>A single work item</doc>
  <descriptor id="description" type="semantic">
    <doc>Human-readable text describing the work to be done</doc>
  </descriptor>
  <descriptor id="stage" type="semantic">
    <doc>Describes where in the process this work item currently is</doc>
  </descriptor>
</descriptor>
```

## Link Relation Descriptors

This is where things get interesting. For [links](https://www.ctrl-alt-dillete.com/2023/06/26/siren-h-factors.html#outbound-links) and [embeds](https://www.ctrl-alt-dillete.com/2023/06/26/siren-h-factors.html#embedded-links), we want to define descriptors for their link relations. You may be tempted to omit [registered link relations](https://www.iana.org/assignments/link-relations/link-relations.xhtml), but documenting these in ALPS is very easy with [the `def` attribute](https://datatracker.ietf.org/doc/html/draft-amundsen-richardson-foster-alps-07#section-2.2.3):

```xml
<descriptor id="Card" type="semantic">
  <!-- ... -->
  <descriptor id="collection"
              type="safe"
              rt="#KanbanBoard"
              def="https://www.rfc-editor.org/rfc/rfc6573.html" />
  <descriptor id="profile"
              type="safe"
              def="https://www.rfc-editor.org/rfc/rfc6906.html" />
</descriptor>
```

In this example we define descriptors for the `collection` and `profile` link relations, linking to the corresponding RFCs that define them. Because these describe hypermedia controls for [safe requests](https://www.rfc-editor.org/rfc/rfc9110.html#name-safe-methods), we set the descriptor's `type` to `safe`.

Furthermore, we utilize [the `rt` attribute](https://datatracker.ietf.org/doc/html/draft-amundsen-richardson-foster-alps-07#section-2.2.13) to indicate the `collection` link refers to the `KanbanBoard` entity of our API. In general, when a link relation refers to another entity, the corresponding link relation `descriptor` should reference the entity class `descriptor` with the `rt` attribute. However, this only works for single-class target entities (e.g., `class` is `["Card"]`). Unfortunately, ALPS does not support describing a multi-class target entity (e.g., `class` is `["Person", "Entity"]`). At best, we can pick one of the class descriptors to reference. Depending on your entity graph, this may not be an issue.

For [extension link relations](https://www.rfc-editor.org/rfc/rfc8288.html#section-2.1.2) we set the `id` to a URI and include our own documentation. Suppose we want to signify that one `Card` blocks the completion of another `Card` by linking the latter to the former with the relation type `https://api.example.com/rel/blocked-by`. We would document that link relation as follows:

```xml
<descriptor id="https://api.example.com/rel/blocked-by" type="safe" rt="#Card">
  <doc>Refers to a card that blocks the context card from being completed.</doc>
</descriptor>
```

While this technically complies with [RFC 8288](https://www.rfc-editor.org/rfc/rfc8288.html) requirements for custom link relations, using absolute URIs for descriptors can be cumbersome. If we serve our ALPS document from say `https://api.example.com/profile`, then the link to the above descriptor would be

```xml
https://api.example.com/profile#https://api.example.com/rel/blocked-by
```

Having a URI whose fragment is another URI may be jarring to some API users and introduces room for error, especially if we host our API in multiple environments, each with it's own host name.

However, RFC 8288 states that "while extension relation types are required to be URIs, a [serialization] of links can specify that they are expressed in another form, as long as they can be converted to URIs." For that reason, I generally recommend sticking to short, human-readable names for custom link relations. With this approach, our custom link relation `descriptor` becomes the following:

```xml
<descriptor id="blocked-by" type="safe" rt="#Card">
  <doc>Refers to a card that is blocking this card from being completed.</doc>
</descriptor>
```

As we've seen, these types of custom link relations can be converted to URIs simply by appending the `descriptor` `id` to the profile link as the fragment, thus maintaining compliance with RFC 8288.

```xml
https://api.example.com/profile#blocked-by
```

## Action and Field Descriptors

Now let's turn our attention toward actions and fields. We define action names within the entity class `descriptor` and then define names of fields present those actions within each action's `descriptor`. An action's `descriptor` will have a `type` of `safe`, `idempotent`, or `unsafe` depending on the type of request it describes.

In our Kanban Board API, a `Card` entity contains two `idempotent` actions that move it between stages, each of which contain two fields: `description` and `stage`.

```xml
<descriptor id="Card" type="semantic">
  <!-- ... -->
  <descriptor id="move-to-next-stage" type="idempotent" rt="#Card">
    <doc>
      Moves the card to the next stage. Only available on cards that are
      not in the last stage.
    </doc>
    <descriptor href="#description" />
    <descriptor href="#stage" />
  </descriptor>
  <descriptor id="move-to-previous-stage" type="idempotent" rt="#Card">
    <doc>
      Moves the card to the previous stage. Only available on cards that
      are not in the first stage.
    </doc>
    <descriptor href="#description" />
    <descriptor href="#stage" />
  </descriptor>
</descriptor>
```

Since the descriptors for `description` and `stage` are identical to the ones for the `Card` properties of the same name, we use [the `href` attribute](https://datatracker.ietf.org/doc/html/draft-amundsen-richardson-foster-alps-07#section-2.2.8) to reference them back up in the document hierarchy.

Similar to link relations, we use the `rt` attribute to indicate that the response to each of these actions is a `Card` entity. Again, this works well for single-class response entities, but we're limited with how we can describe multi-class responses.

## Other Class Descriptors

While the Kanban Board API doesn't use them, I'd like to touch on class values for links, actions, and fields. Those that refer to an entity's class (e.g., a link to another entity) are covered above.

For other uses of class (e.g., an `Integer` field signifying only whole-number input), I recommend simply documenting them at the top level like we did for entity classes, except without any child descriptors. However, ALPS has no way (at least an obvious one) to associate these class descriptors to the corresponding link relation, action, or field `descriptor` (e.g., associating the `descriptor` for `Integer` to a `descriptor` for the `quantity` field).

## The Final Product 🎉

Here's the complete ALPS document for our Kanban Board API. Note that there are slight differences from the examples above, like lifting shared descriptors to the top level and the use of [the `tag` attribute](https://datatracker.ietf.org/doc/html/draft-amundsen-richardson-foster-alps-07#section-2.2.14) to denote the type of Siren element(s) it describes.

```xml
<alps
  version="1.0"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:noNamespaceSchemaLocation="https://alps-io.github.io/schemas/alps.xsd">
  <doc>
    This document defines the application semantics of the Kanban Board API.
  </doc>

  <descriptor id="description" type="semantic" tag="property field">
    <doc>Human-readable text describing the work to be done</doc>
  </descriptor>
  <descriptor id="stage" type="semantic" tag="property field">
    <doc>Describes where in the process this work item currently is</doc>
  </descriptor>
  <descriptor id="profile"
              type="safe"
              def="https://www.rfc-editor.org/rfc/rfc6906.html"
              tag="link-relation" />

  <descriptor id="Card" tag="entity">
    <descriptor href="#description" />
    <descriptor href="#stage" />

    <descriptor id="collection"
                type="safe"
                rt="#KanbanBoard"
                def="https://www.rfc-editor.org/rfc/rfc6573.html"
                tag="link-relation" />
    <descriptor id="blocked-by" type="safe" rt="#Card" tag="link-relation">
      <doc>Refers to a card that is blocking this card from being completed.</doc>
    </descriptor>
    <descriptor href="#profile" />

    <descriptor id="move-to-next-stage" type="idempotent" rt="#Card" tag="action">
      <doc>
        Moves the card to the next stage. Only available on cards that are
        not in the last stage.
      </doc>
      <descriptor href="#description" />
      <descriptor href="#stage" />
    </descriptor>
    <descriptor id="move-to-previous-stage" type="idempotent" rt="#Card" tag="action">
      <doc>
        Moves the card to the previous stage. Only available on cards that
        are not in the first stage.
      </doc>
      <descriptor href="#description" />
      <descriptor href="#stage" />
    </descriptor>
  </descriptor>

  <descriptor id="KanbanBoard" type="semantic" tag="entity">
    <descriptor id="item"
                type="safe"
                rt="#Card"
                def="https://www.rfc-editor.org/rfc/rfc6573.html"
                tag="link-relation" />
    <descriptor href="#profile" />

    <descriptor id="create-card" type="unsafe" rt="#Card" tag="action">
      <doc>Creates a new card</doc>
      <descriptor href="#description" />
    </descriptor>
  </descriptor>
</alps>
```

## Linking to a Profile

The last thing to do is to [serve our ALPS document](https://github.com/siren-js/examples/blob/main/kanban-board/server/src/main.ts#L17-L19) and link to it from each entity using [the `profile` link relation](https://www.rfc-editor.org/rfc/rfc6906.html). Here's an example `profile` link:

```json
{
  "rel": ["profile"],
  "href": "https://api.example.com/profile",
  "type": "application/alps+xml"
}
```

Providing this link in each entity allows API users to follow it from any point in the entity graph to learn more about our API's application semantics.

## Summary

In general, the process for documenting a Siren API with ALPS is as follows:

1. Define a `semantic` `descriptor` for each entity's class values.
2. Within each entity class `descriptor`, define a `descriptor` for every link relation, property name, and action name that may be present in the entity.
   1. Each property name `descriptor` is `semantic`.
   2. Each link relation `descriptor` is `safe`.
   3. Each action name is either `safe`, `idempotent`, or `unsafe` (depending on the action's `method`).
3. Within each action name `descriptor`, define a `semantic` `descriptor` for every name of every field that may be present in the action.

To keep our ALPS documents [DRY](https://en.wikipedia.org/wiki/Don't_repeat_yourself), define shared descriptors and reference them using the `href` attribute. These can technically appear anywhere in the document since they are referenced by `id`. In fact, this isn't the only way to write an ALPS document for a Siren API. You could, for example, define every descriptor at the top level and (optionally) reference them in nested descriptors, like we did with the shared descriptors.

Despite a couple aforementioned shortcomings, ALPS is an effective tool for documenting Siren APIs. We're able to mimic Siren's format with ALPS's hierarchical structure, making it easy to read and understand, as long as you're familiar with [Siren's schema](https://github.com/kevinswiber/siren/blob/master/siren.schema.json). Admittedly, ALPS is still in its infancy, so tooling is quite sparse, but I hope this post motivates at least one person to [contribute to ALPS](https://github.com/alps-io/) in whatever capacity they can.
