---
title: REST APIs ain't RESTful, Part 2
excerpt: Demonstrating the effects of violating the hypermedia constraint
tags: api hypermedia rest
---

In [part 1]({% post_url 2023-02-16-rest-apis-aint-restful %}), I talked about how "REST" APIs don't actually satisfy the constraints of [REST architecture](https://www.ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm). It's very easy to ignore [the hypermedia constraint](https://www.ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm#sec_5_1_5) due to it's highly abstract definitions and lack of real-world examples, so now I want to demonstrate how violating that constraint via the absence of hypermedia impacts the API and its clients.

I'll do so by presenting a simple "REST" API and client, then identify the problematic areas that are often overlooked. I won't go into detail on the server implementation since all the issues can be seen through the client implementation, but I do have [implementations of both on my GitHub](https://github.com/dillonredding/kanban-board-rest-api) for those that like to get their hands dirty.

## The "REST" API

Let's suppose we have an API that models a [kanban board](https://en.wikipedia.org/wiki/Kanban_board). The primary resource is a card, which sits in a column defining one of three stages: `To-Do`, `Doing`, `Done`. These stages define a workflow of resource state changes. In particular, a card in the `To-Do` stage can only move to the `Doing` stage. From `Doing`, the card can move to `Done` or back to `To-Do`. Finally, a card in the `Done` stage can only move back to `Doing`. In summary, a card cannot skip a stage and cannot wrap around. Here's a state diagram depicting the workflow:

![Kanban board workflow](/assets/img/kanban-board-workflow.svg)

As for the protocol details, we only need two operations for our example. First, the client needs to be able to retrieve a list of cards. Here's an example request/response:

```http
GET /cards HTTP/1.1
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

[
  {
    "id": 69420,
    "description": "Laundry",
    "stage": "To-Do"
  },
  {
    "id": 420,
    "description": "Play video games",
    "stage": "Doing"
  },
  {
    "id": 69,
    "description": "Dishes",
    "stage": "Done",
  }
]
```

Second, the client needs to be able to move a card from one stage to another. This request moves a card to `Doing`:

```http
PATCH /cards/69420 HTTP/1.1
Content-Type: application/json

{ "stage": "Doing" }
```

If the update is valid (i.e., follows the rules above), we respond with a `200 (OK)` and the updated resource.

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": 69420,
  "description": "Laundry",
  "stage": "Doing"
}
```

If a client tries to skip a stage, they get a `400 (Bad Request)`.

## The "REST" Client

Now consider a client that moves all the cards on the board from one stage to the next (from left to right). The implementation is given below. If you don't understand JavaScript, don't worry, I'll walk you through it.

<!-- prettier-ignore -->
```js
async function main() {
  const cards = await fetch(`${baseUrl}/cards`)                 // (1)
    .then((res) => res.json());
  cards.forEach((card) => {
    if (card.stage !== 'Done') {                                // (2)
      moveToNextStage(card).then((card) => {
        console.log(`Updated ${card.id} to ${card.stage}`);
      });
    }
  });
}

async function moveToNextStage(card) {
  const stage = nextStage(card);
  if (stage == null) return;

  const response = await fetch(`${baseUrl}/cards/${card.id}`, { // (1)
    method: 'PATCH',                                            // (1)
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ stage })                             // (1)
  });
  return await response.json();
}

function nextStage(card) {
  if (card.stage === 'To-Do') return 'Doing';                   // (2)
  if (card.stage === 'Doing') return 'Done';                    // (2)
  return null;
}

main();
```

We first define a `main` function as our entry point, which [fetches](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) the card collection, parses the response content as JSON, and iterates through each `card` in the response. If the `card` isn't in the `Done` `stage`, then we pass it to the `moveToNextStage` function and print a message to the console when that completes.

In the `moveToNextStage` function we determine the next stage using the `nextStage` function, which returns the next stage of the given `card`, or `null` if there is no next stage (i.e., the card is in the `Done` stage). Assuming there's a next stage, we make the update request and parse the response content as JSON.

Finally, we call `main` to initiate the process.

## The Problem

Notice how the client is aware of several server implementation details that are out of its control? These details fall into two categories (borrowed from [_RESTful Web APIs_](https://www.oreilly.com/library/view/restful-web-apis/9781449359713/), but with slightly different meanings), which correspond to the numbered comments in the client implementation snippet above:

1. Protocol semantics
2. Application semantics

Protocol semantics refer to the set of HTTP requests a client can make. That is, the various combinations of HTTP methods, URLs, and request payloads, as well as the response format. In our example above, the client makes a `GET` request for `/cards` and a `PATCH` request for `/cards/{id}` with a JSON payload.

Application semantics are the more domain-specific details, the business logic if you will. Our example client implements the card stage workflow (at least in one direction) in the `nextStage` function. There is also logic to ensure it doesn't move cards that are `Done`.

The problem is that both protocol and application semantics are controlled by the server. It controls resource URLs, it controls which HTTP methods each resource supports, and most importantly it controls the domain. Yet the client is forced to hard-code these details in its implementation.

If that doesn't seem like a big deal, think about what happens when it comes time to change one of those details. For instance, what if there's a typo in a URL that the server wants to fix? What if the server wants to support `PUT` for updates? There are simple, backward-compatible solutions to these changes in protocol semantics, but what about the application semantics?

In a more realistic scenario, the server might add an `Approved` stage between `Doing` and `Done`. Perhaps `Approved` is optional, which results in a non-linear workflow. Maybe it changes the wording of the original stages to `Waiting`, `In Progress`, and `Complete`. Each of these changes requires careful planning for both components, which may not be feasible depending on the system in question.

## The Conclusion

> "That is RPC. It screams RPC. There is so much coupling on display that it should be given an X rating."
>
> — Roy Fielding, [REST APIs must be hypertext-driven](https://roy.gbiv.com/untangled/2008/rest-apis-must-be-hypertext-driven)

Without hypermedia, clients are required to intimately understand protocol and application semantics at design time, tightly coupling them to the server, making clients and the server difficult to change without coordination, and greatly limiting, if not entirely eliminating, component [evolvability](https://www.ics.uci.edu/~fielding/pubs/dissertation/net_app_arch.htm#sec_2_3_4_1).

Software must be able to adapt to the requirements of its users, requirements that inevitably change. A system that cannot change to meet its users' needs will eventually become obsolete. In a distributed system, the independent evolution of components is crucial. While the examples given in this post are quite simple, they demonstrate the effects on [modifiability](https://www.ics.uci.edu/~fielding/pubs/dissertation/net_app_arch.htm#sec_2_3_4). In more complex instances, independently modifying clients and the server becomes especially more difficult.

The server can encapsulate its implementation details by providing things like protocol semantics at runtime via hypermedia. "How?", you might ask. Check out my follow-up post [API Evolvability with Siren]({% post_url 2023-07-14-rest-apis-aint-restful-pt-3 %}).

One final note: I don't advocate that _every_ system conform to REST architecture. There is no one architecture to rule them all. Context is king. Every software architecture has benefits _and_ costs that should be carefully considered in each context.
