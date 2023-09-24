---
title: API Evolvability with Siren
excerpt: Exploring adaptability through hypertext
tags: api hypermedia rest siren
---

> "Everything changes and nothing stands still."
>
> — Heraclitus

In [a previous post]({% post_url 2023-05-07-rest-apis-aint-restful-pt-2 %}), I explored how failing to satisfy the hypermedia constraint of REST architecture necessitates tight client-server coupling. In a typical "REST" API, we represent resources as JSON data, which can be useful, but it doesn't tell clients what to do after a request. A common solution to this problem is to enumerate API operations in out-of-band documentation such as [OpenAPI](https://www.openapis.org/), [WSDL](https://en.wikipedia.org/wiki/Web_Services_Description_Language), or a developer portal. However, these approaches force clients to understand every API operation and their execution sequence ahead of time.

[Hypertext](https://en.wikipedia.org/wiki/Hypertext), on the other hand, provides affordance metadata at runtime within the representation format. [Siren](https://github.com/kevinswiber/siren) is a hypertext format for representing web API resources as entities. In this post, I'd like to show you how to utilize hypertext via Siren in order to achieve [evolvability](https://www.ics.uci.edu/~fielding/pubs/dissertation/net_app_arch.htm#sec_2_3_4_1). I'll do so by presenting [an updated version of the Kanban Board API and client](https://github.com/siren-js/examples/tree/main/kanban-board) from the last post.

If you're new to Siren, I recommend starting out by reading [the specification](https://github.com/kevinswiber/siren/blob/master/README.md) to get acquainted with Siren's elements (links, actions, etc.). Then check out [Siren H-Factors]({% post_url 2023-06-26-siren-h-factors %}) to understand Siren's hypertext features in more depth. For further insight into design and usage, see [Siren Best Practices](https://siren-js.github.io/best-practices/).

## Siren Server

As foreshadowed, we need to update our server so that it represents resources as Siren entities instead of plain JSON objects and arrays. That means changing the response's `Content-Type` header to `application/vnd.siren+json` and generating entities for our collection and item resources.

For brevity's sake, I'm only going to cover changes to representations in our API. You can find [the server implementation details on GitHub](https://github.com/siren-js/examples/tree/main/kanban-board/server).

### Representing a Card

To represent our item resource (a card), we'll construct a `Card` entity.

```json
{
  "class": ["Card"],
  "title": "Card 42",
  "properties": {
    "description": "Play video games",
    "stage": "Doing"
  },
  "links": [
    {
      "rel": ["self"],
      "href": "/cards/42"
    }
  ],
  "actions": [
    {
      "title": "Move to Done",
      "name": "move-to-next-stage",
      "method": "PATCH",
      "href": "/cards/42",
      "fields": [
        {
          "type": "hidden",
          "name": "stage",
          "value": "Done"
        }
      ]
    }
  ]
}
```

As with plain JSON, we have properties for `description` and `stage`, but their nested in the `properties` object. The `id` property is no longer necessary because the card's URI already identifies it and can be found in the `self` link.

We represent the request to move a card to the following stage with the `move-to-next-stage` action. This action is only generated when it is appropriate to do so. In particular, `move-to-next-stage` is absent when the `Card` is `Done`, and present otherwise.

Moreover, `move-to-next-stage` includes a `stage` field whose `value` is the next stage. This field is hidden to avoid requiring the client to know the stage values ahead of time.

### Representing the Kanban Board

For our board, we'll create a `KanbanBoard` entity that acts as the collection of `Card` entities, which are embedded with the relation type `item`, [a standard relation type](https://www.rfc-editor.org/rfc/rfc6573.html#section-2.1). Embedded `Card`s can be [resolved]({% post_url 2023-06-26-siren-h-factors %}#embedded-links) by the client as needed.

```json
{
  "class": ["KanbanBoard"],
  "links": [
    {
      "rel": ["self"],
      "href": "/cards"
    }
  ],
  "entities": [
    {
      "rel": ["item"],
      "class": ["Card"],
      "href": "/cards/42"
    },
    {
      "rel": ["item"],
      "class": ["Card"],
      "href": "/cards/43"
    }
  ]
}
```

## Siren Client

Now let's turn our attention to the client. While our server implementation only required adding a transformation layer, the client needs a complete rewrite, but for good reason.

<!-- prettier-ignore -->
```js
import { follow, parse, resolve, submit } from '@siren-js/client';

async function main() {
  const kanbanBoard = await follow(baseUrl).then(parse);

  const cards = await Promise.all(
    kanbanBoard.entities
        .filter((subEntity) => subEntity.rel.includes('item'))
        .map(resolve)
  );

  cards.forEach((card) => {
    const action = card.getAction('move-to-next-stage');
    if (action != null) {
      submit(action)
        .then(parse)
        .then((card) => {
          const { description, stage } = card.properties;
          console.log(`${description} updated to ${stage}`);
        });
    }
  });
}

main();
```

In the `main` function, we use the [Siren.js client library](https://github.com/siren-js/client) to `follow` our API's entry point URL and `parse` the response as Siren. Then we find all the `item` sub-entities and `resolve` them to ensure we have all embedded entities and no embedded links. We iterate over the result, looking for the `move-to-next-stage` action in each embedded `Card`. If it's present, submit it, parse the response as Siren, and finally log the `Card`'s `description` and updated `stage`.

Notice that the client makes no assumptions about protocol semantics. It understands Siren and where to look for `item` sub-entities and `move-to-next-stage` actions. Granted, there are assumptions made about which type of entity we get at certain points. As an exercise, I encourage you to try improving that aspect of the client to help gain a deeper understanding of the client.

## Adapting to Change

With our server and client updated, let's put the latter to the test by exploring a couple example server enhancements, focusing on the two types of details relevant to clients.

### Changing Protocol Semantics

Say we want `move-to-next-stage` to be [idempotent](https://www.rfc-editor.org/rfc/rfc9110.html#name-idempotent-methods), rather than non-idempotent. The advantage of an idempotent action is that if the underlying HTTP request fails, clients can safely resubmit the action (except in the case of a `400 (Bad Request)`).

Implementing this change requires two small updates to the server. First, when generating the `move-to-next-stage` action, use `PUT` instead of `PATCH` for the `method`. Second, include a hidden `description` field whose `value` is that of the `Card`'s `description` property. Including this field means the full state of the `Card` is sent to the server on submission, which better adheres to `PUT`'s "replace" semantics.

```json
{
  "title": "Move to Done",
  "name": "move-to-next-stage",
  "method": "PUT",
  "href": "/cards/42",
  "fields": [
    { "type": "hidden", "name": "description", "value": "Play video games" },
    { "type": "hidden", "name": "stage", "value": "Done" }
  ]
}
```

No change to the client is necessary. It will automatically adapt to those modifications because the client makes no assumptions about protocol methods, and there is still no data required for submission. Protocol semantics are completely encapsulated from the client by dynamically providing them at runtime.

### Changing Application Semantics

Suppose we want to add an `Approved` stage between `Doing` and `Done`. Implementing that change only requires updating the server-side logic that generates the `move-to-next-stage` action. Specifically, set the `value` of the `stage` field to `Approved` if the `Card` is in the `Doing` stage.

Again, no change is needed for our client because it does not care about specific stages, or event the proper sequence between stages. This would also be true if we renamed stages (e.g., `Complete` instead of `Done`), [internationalized](https://en.wikipedia.org/wiki/Internationalization_and_localization) stage names, or reordered stages altogether. The workflow is encapsulated through affordances (`actions`) with an identifier (`name`).

## Conclusion

While the example presented above is quite simple, it demonstrates that hypertext does indeed afford [evolvability](https://www.ics.uci.edu/~fielding/pubs/dissertation/net_app_arch.htm#sec_2_3_4_1) to an API by properly encapsulating its implementation details. Instead of hard-coding protocol semantics into clients, they get those details uniformly at runtime through the representation format, allowing them to focus more on the problem domain.

Programming a Siren client generally involves teaching it how to interpret descriptors, which are signals for how to navigate the entity graph. This could involve following links or resolving sub-entities found through link relations (`rel` values), populating fields by `name`, or submitting actions found by `name`.

As long as these descriptors and their semantics don't change, the server and its clients are able to independently evolve within the constraints of those semantics. In the example above, our client was able to withstand changes to protocol and application semantics that would have easily broken [the original implementation](https://github.com/dillonredding/kanban-board-rest-api). The server is free to evolve without the need for client coordination, as long as changes are semantically backward compatible.

Siren allows for much more expressive APIs, communicating not only resource state but also available operations and relationships to other resources. That does not mean Siren clients are resilient to _all_ types of change. For instance, adding a required field to an action will likely break clients that try to submit that action. In all fairness though, requiring new input is a breaking change to _any_ API.

Utilizing hypertext achieves a level of evolvability that isn't possible in conventional "REST" APIs. The hypertext format itself effectively becomes the API, requiring both clients _and_ server to conform to the constraints of the media type, which decouples clients from any one particular server.
