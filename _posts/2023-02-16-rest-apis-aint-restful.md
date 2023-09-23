---
title: REST APIs ain't RESTful
excerpt: Analysis of fiat REST API architecture
tags: api hypermedia rest
---

With Twitter going to shit, I thought I'd retroactively transcribe [a tweet of mine](https://twitter.com/dillon_redding/status/1626265554020335616) into a blog post so you can read at your leisure without worrying about their shenanigans.

## Assessing Constraints

Countless so-called "REST" APIs are nothing more than JSON-CRUD over HTTP. However, [RESTful architecture](https://www.ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm) is defined by several constraints that a system must satisfy in order to be truly RESTful. Let's briefly cover each constraint and see where "REST" APIs pass or fail. I won't explain the constraints themselves, so be sure to check out the linked article or [the Wikipedia article](https://en.wikipedia.org/wiki/Representational_state_transfer#Architectural_constraints) for a more abbreviated explanation.

### ✅ Client-Server

We get this one for [free with HTTP](https://www.rfc-editor.org/rfc/rfc9110.html#section-3.3). REST doesn't require HTTP, but it's the de facto protocol for 99.9% of APIs, so for all intents and purposes, we're good here.

### ✅ Stateless

We also get statelessness for free since HTTP is a stateless protocol. If your API violates this constraint with something like cookies, you should seriously reconsider your choices.

### ✅ Cache

Yet again caching is something we get with HTTP since it has it [built in](https://www.rfc-editor.org/rfc/rfc9111.html), however underutilized it may be. It's worth noting that we're talking about network-level caching, not caching internal to the server (e.g., database calls).

### ✅ Layered System

Another thing we get for free with [HTTP intermediaries](https://www.rfc-editor.org/rfc/rfc9110.html#name-intermediaries).

### ❌ Uniform Interface

This is where things get interesting. The uniform interface constraint consists of several sub-constraints around the API's design.

#### ✅ Identification of Resources

Despite ad nauseam debates of "proper" URL design, this first sub-constraint is [baked into HTTP](https://www.rfc-editor.org/rfc/rfc9110.html#name-identifiers-in-http).

#### ✅ Manipulation of Resources through Representations

HTTP messages are used to manipulate resources. Even though it's mostly fiat JSON, [message content](https://www.rfc-editor.org/rfc/rfc9110.html#name-content) is a representation of that resource.

#### ✅ Self-Descriptive Messages

[HTTP headers](https://www.rfc-editor.org/rfc/rfc9110.html#name-header-fields) describe the message itself. The format of the body (`Content-Type`), how long the body is (`Content-Length`), when it was sent (`Date`), etc.

#### ❌ Hypermedia as the Engine of Application State

Finally, we come to the crux: hypermedia. This is the thing that servers use to dynamically tell clients what they can do at runtime. Think links (`<a>`) and forms (`<form>`) in HTML.

Most "REST" APIs simply provide a JSON object or array representation and call it a day. Without hypermedia, clients are forced to make sweeping assumptions about subsequent requests, which leads to very tight coupling to the server, effectively usurping the server's ownership of its API.

This issue may be difficult to see upfront, but it quickly becomes apparent when it comes time for change, especially minor implementation details like HTTP methods or URLs. Don't even think about changing business logic on the server without coordinating with clients. Historically, those types of changes have been achieved through versioning, but that's expensive and it places a heavy burden on clients who then need to worry about migrating.

## Conclusion

> "...if the engine of application state (and hence the API) is not being driven by hypertext, then it cannot be RESTful..."
>
> — Roy Fielding, [REST APIs must be hypertext-driven](https://roy.gbiv.com/untangled/2008/rest-apis-must-be-hypertext-driven)

So, what's this mean? Just add hypermedia to our "REST" API, right? Well, before you run off and start adding links and forms to your JSON, or worse, use HTML instead, note that representation semantics are communicated via [media type in HTTP](https://www.rfc-editor.org/rfc/rfc9110.html#section-8.3.1). Plain JSON (`application/json`) merely represents a primitive value (string, number, boolean, or null) or simple data structure (map or list). Beyond parsing JSON text, clients get no additional semantics because plain JSON has no concept of links and forms.

You could add a URL as a string property, but it's nothing more than a string. Sure, you can code the client to understand it, but it creates the same coupling issue. This may be fine until things need to change. Instead, consider using a well-defined hypermedia format such as [HAL](https://stateless.group/hal_specification.html), [Siren](https://github.com/kevinswiber/siren), [Collection+JSON](http://amundsen.com/media-types/collection/), or [UBER](https://rawgit.com/uber-hypermedia/specification/master/uber-hypermedia.html). These aren't all equal and serve different purposes, so you should evaluate which one works best based on the needs of your API.

But what do we call an API that satisfies _all_ the REST constraints? The term "REST" has become so bastardized that reclaiming it seems infeasible. To distinguish truly RESTful APIs from faux-REST APIs, I generally refer to them as **hypermedia APIs**.

All this said, I'm not intending to gatekeep. I only want to show why a "REST" API isn't realizing the [architectural properties](https://www.ics.uci.edu/~fielding/pubs/dissertation/net_app_arch.htm#sec_2_3) (e.g., scalability, modifiability) promised by a RESTful architecture, before blaming the architectural style itself. Be sure to check out [part 2]({% post_url 2023-05-07-rest-apis-aint-restful-pt-2 %}) for a demonstration.
