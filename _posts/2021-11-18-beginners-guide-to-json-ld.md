---
title: Beginner's Guide to JSON-LD
excerpt: A brief intro to JSON-LD and the framework behind it
---

# Beginner's Guide to JSON-LD

I've become sort of the de facto expert on [JSON-LD](https://json-ld.org/) where I work and with all the questions I've been getting, I thought I'd write a little guide to make learning and getting started with JSON-LD a little easier and available to a wider audience.

While there's already a lot of [learning material for JSON-LD](https://json-ld.org/learn.html) out there, I found JSON-LD quite daunting and confusing for a long time. So, hopefully, my perspective in this guide can help other, like-minded individuals.

## What is JSON-LD?

JSON-LD is a serialization format of the [Resource Description Framework](https://www.w3.org/TR/rdf11-concepts/) (RDF), a component of [linked data](https://www.w3.org/standards/semanticweb/data) (hence the "LD"), which is itself a part of the tech stack of the [semantic web](https://www.w3.org/standards/semanticweb/). Simply put, JSON-LD allows us to add important semantic information that's missing from normal JSON representations.

Consider a JSON object with `firstName` and `lastName` fields representing a person's name. These names may be fine, for say display purposes, but what if we want to know which is the given name and which is the family name? There's not enough information there since [name order](https://en.wikipedia.org/wiki/Personal_name#Name_order) varies around the world. Even with a locale, it could require a lot of work to determine which is name is which.

JSON-LD lets us add this semantic information by essentially defining what fields like `firstName` and `lastName` mean in the context of our JSON document.

Before we dig any deeper into the details of JSON-LD though, let's first cover some basic principles from RDF, the framework behind JSON-LD.

## RDF Basics

RDF gives us a way of describing an ontology of resources, which is essentially a [labeled](https://en.wikipedia.org/wiki/Graph_labeling), [directed graph](https://en.wikipedia.org/wiki/Directed_graph). These graphs are built up from [**triples**](https://www.w3.org/TR/rdf11-concepts/#section-triples), the most basic structure in RDF. Triples consist of a subject, a predicate, and an object.

![Visual depiction of a triple](/assets/img/triple-graph.webp)

The **subject** and **object** of a triple are nodes in a graph, and the **predicate** is an arrow relating the subject to the object. The values for each component form the labels of the graph. There are three types of labels: IRI, blank, or literal.

An [IRI](https://en.wikipedia.org/wiki/Internationalized_Resource_Identifier) is the unique address of a resource. IRIs form a superset of URIs that allow for internationalization. However, we'll be using URLs throughout this guide, since they are dereferenceable URIs. So, for the mathematically inclined:

![URLs ⊂ URIs ⊂ IRIs](/assets/img/uri-hierarchy.webp)

An IRI is a valid label for any component of a triple. It's worth noting that a triple's predicate must be IRIs.

A blank label, or [blank node identifier](https://www.w3.org/TR/rdf11-concepts/#dfn-blank-node-identifier), is used to describe a [blank node](https://www.w3.org/TR/rdf11-concepts/#dfn-blank-node)—a resource without an IRI—and so this type of label is only valid for subjects and objects. The format of a blank node identifier depends on which RDF serialization format we're using. In JSON-LD, a blank node identifier is a string that starts with `\_:`. However, explicit identifiers for blank nodes are rarely needed.

A [literal](https://www.w3.org/TR/rdf11-concepts/#dfn-literal) is used to describe data about another resource, things like numbers (`42`), dates (`"1970–01–01"`), or just plain strings (`"foo"`). These labels are only valid in the object position of a triple.

And that's it! Those are the basics of RDF we need for now. I've only scratched the surface here, so I recommend reading [W3C's RDF Primer](https://www.w3.org/TR/rdf11-primer/) if you're interested in learning more about RDF.

Now let's shift our focus to building our own graph, but before we jump into expressing it with JSON-LD, for pedagogical purposes, let's build off our knowledge of triples and use a much simpler RDF format called [N-Triples](https://www.w3.org/TR/n-triples/).

## N-Triples Example

In this example, we'll cover the different types of triples we need to describe the following graph:

![Example graph](/assets/img/example-graph.webp)

### Starting Simple

Let's start by constructing a triple to describe the given name of a person. To do so, we need a subject, a predicate, and an object.

First, for our subject, let's start from the top of the graph with Neville Longbottom. We need an IRI (or blank node identifier, but we'll get to that later) to identifier Neville. Let's arbitrarily choose [the Harry Potter Wiki page](https://harrypotter.fandom.com/wiki/Neville_Longbottom), although we could use [the Wikipedia page](https://en.wikipedia.org/wiki/Neville_Longbottom), [the Heroes Wiki page](https://hero.fandom.com/wiki/Neville_Longbottom), or some other IRI.

Next, let's (again, arbitrarily) go with [the `givenName` property](https://schema.org/givenName) from [Schema.org](https://schema.org/) for the predicate, which tells us that the object is the given name of the subject.

We could instead use [the `givenName` property](http://xmlns.com/foaf/spec/#term_givenName) from [FOAF](<https://en.wikipedia.org/wiki/FOAF_(ontology)>) or a similar term from another vocabulary. Regardless of what we choose, we should use terms from one or more well-defined vocabularies like Schema.org, FOAF, [Dublin Core](http://dublincore.org/documents/dcmi-terms/), or a custom vocabulary.

> Remember that a predicate must be an IRI, but an IRI doesn't have to be dereferenceable (e.g., `urn:uuid:f124874d-13e6–487b-adcd-63e432479315`). However, it's good practice for a predicate to point to some sort of documentation that defines what it means, so we can easily look it up.

Finally, our object can just be a string literal of the given name. With that our first triple is as follows:

```nt
<https://harrypotter.fandom.com/wiki/Neville_Longbottom> <https://schema.org/givenName> "Neville" .
```

### Specifying Datatypes

Now let's look at a triple describing Neville's birthday:

```nt
<https://harrypotter.fandom.com/wiki/Neville_Longbottom> <http://xmlns.com/foaf/0.1/birthday> "1980-07-30"^^<http://www.w3.org/2001/XMLSchema#date> .
```

In this one, the subject is the same as before, but the predicate uses [FOAF's `birthday` property](http://xmlns.com/foaf/spec/#term_birthday) (showing we're not limited to one vocabulary) and the object is a **typed literal**. Since the value is a date, a simple string doesn't quite convey enough, so we specify additional type information with a datatype IRI.

In this case, we use the `date` datatype from the [XML Schema](https://www.w3.org/TR/xmlschema11-2/). Similar to the vocabularies for predicates, the use of these specific datatypes isn't required by RDF, but they are highly recommended.

> We can also type [`boolean`](https://www.w3.org/TR/xmlschema11-2/#boolean), [`integer`](https://www.w3.org/TR/xmlschema11-2/#integer), and [`double`](https://www.w3.org/TR/xmlschema11-2/#double) literals, but I won't get into that with N-Triples since JSON (and subsequently JSON-LD) natively supports those types. The syntax for types is also unimportant since it's very different (and much easier) in JSON-LD.

This info comes in handy when parsing the data in some programming language. In JavaScript, for instance, the datatype IRI `http://www.w3.org/2001/XMLSchema#date` could signal a parser to use `Date` instead of `String` when parsing the literal. Then we could use native `Date` methods to, say, convert the value to a Unix timestamp.

### Typed Nodes

In addition to typing a literal, we can specify the type of a node:

```nt
<https://harrypotter.fandom.com/wiki/Neville_Longbottom> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://schema.org/Person> .
```

This triple uses RDF's predicate for specifying a node's type, which is [the `Person` type](https://schema.org/Person) from Schema.org.

> Don't let the "schema" in "Schema.org" confuse you. From the perspective of RDF, the purpose of Schema.org is to define vocabulary terms. It is not meant to define the structure or shape of data. For example, just because we have a `Person` resource doesn't mean it will have every property listed (`email`, `familyName`, etc.). The shape of a data instance is an orthogonal concern better suited to something like [JSON Schema](https://json-schema.org/).

Again, Schema.org isn't required here. We could've just as easily used [FOAF's `Person`](http://xmlns.com/foaf/spec/#term_Person) instead, but we'll stay consistent.

### Relating Resources

Information about a resource is very useful, but the real power of RDF can be seen when we start associating resources with each other.

```nt
<https://harrypotter.fandom.com/wiki/Neville_Longbottom> <https://schema.org/knows> <https://harrypotter.fandom.com/wiki/Luna_Lovegood> .
```

This triple tells us that there is a "generic bi-directional social/work relation" between Neville and Luna. In other words, Neville knows Luna.

Hopefully, you can see how this becomes very powerful since we can also have triples where Luna (the object) is the subject.

```nt
<https://harrypotter.fandom.com/wiki/Luna_Lovegood> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://schema.org/Person> .
<https://harrypotter.fandom.com/wiki/Luna_Lovegood> <https://schema.org/givenName> "Luna" .
<https://harrypotter.fandom.com/wiki/Luna_Lovegood> <http://xmlns.com/foaf/0.1/birthday> "1981-02-13"^^<http://www.w3.org/2001/XMLSchema#date> .
```

It's worth noting that a subject can use the same predicate multiple times.

```nt
<https://harrypotter.fandom.com/wiki/Neville_Longbottom> <https://schema.org/knows> <https://harrypotter.fandom.com/wiki/Ronald_Weasley> .
```

### A Blank Object

We can use a blank node if we want to associate or describe a resource without an IRI.

```nt
<https://harrypotter.fandom.com/wiki/Neville_Longbottom> <https://schema.org/alumniOf> _:hogwarts .
```

This triple says Neville is an alumnus of a blank node identified by `\_:hogwarts`, which can now be used as the subject of other triples.

As I mentioned, blank node identifiers usually aren't explicit in JSON-LD. We'll see how they translate over shortly.

### Internationalized Data

Lastly, let's look at how we can specify the language of a literal.

```nt
_:hogwarts <https://schema.org/slogan> "Draco Dormiens Nunquam Titillandus"@la .
```

This triple says our subject (a blank node) has the slogan "Draco Dormiens Nunquam Titillandus," which is Latin, indicated by the language tag `la`.

### Collecting Our Triples

That's it for various types of triples. Our final N-Triples document describing the above graph is as follows:

```nt
<https://harrypotter.fandom.com/wiki/Neville_Longbottom> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://schema.org/Person> .
<https://harrypotter.fandom.com/wiki/Neville_Longbottom> <https://schema.org/givenName> "Neville" .
<https://harrypotter.fandom.com/wiki/Neville_Longbottom> <http://xmlns.com/foaf/0.1/birthday> "1980-07-30"^^<http://www.w3.org/2001/XMLSchema#date> .
<https://harrypotter.fandom.com/wiki/Neville_Longbottom> <https://schema.org/knows> <https://harrypotter.fandom.com/wiki/Luna_Lovegood> .
<https://harrypotter.fandom.com/wiki/Neville_Longbottom> <https://schema.org/knows> <https://harrypotter.fandom.com/wiki/Ronald_Weasley> .
<https://harrypotter.fandom.com/wiki/Neville_Longbottom> <https://schema.org/alumniOf> _:hogwarts .
<https://harrypotter.fandom.com/wiki/Luna_Lovegood> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://schema.org/Person> .
<https://harrypotter.fandom.com/wiki/Luna_Lovegood> <https://schema.org/givenName> "Luna" .
<https://harrypotter.fandom.com/wiki/Luna_Lovegood> <http://xmlns.com/foaf/0.1/birthday> "1981-02-13"^^<http://www.w3.org/2001/XMLSchema#date> .
<https://harrypotter.fandom.com/wiki/Ronald_Weasley> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://schema.org/Person> .
<https://harrypotter.fandom.com/wiki/Ronald_Weasley> <https://schema.org/givenName> "Ronald" .
_:hogwarts <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://schema.org/Organization> .
_:hogwarts <https://schema.org/name> "Hogwarts School of Witchcraft and Wizardry" .
_:hogwarts <https://schema.org/logo> <https://bit.ly/3kDpyDf> .
_:hogwarts <https://schema.org/slogan> "Draco Dormiens Nunquam Titillandus"@la .
```

This is rather straightforward. It's simply all our triples (plus some) collected in one document. Now let's see how we can use these same ideas in a more familiar format.

## The Power of JSON-LD

Converting our N-Triples graph directly into JSON-LD, we get the following:

```json
{
  "@id": "https://harrypotter.fandom.com/wiki/Neville_Longbottom",
  "@type": "https://schema.org/Person",
  "https://schema.org/givenName": "Neville",
  "http://xmlns.com/foaf/0.1/birthday": {
    "@type": "http://www.w3.org/2001/XMLSchema#date",
    "@value": "1980-07-30"
  },
  "https://schema.org/knows": [
    {
      "@id": "https://harrypotter.fandom.com/wiki/Luna_Lovegood",
      "@type": "https://schema.org/Person",
      "https://schema.org/givenName": "Luna",
      "http://xmlns.com/foaf/0.1/birthday": {
        "@type": "http://www.w3.org/2001/XMLSchema#date",
        "@value": "1981-02-13"
      }
    },
    {
      "@id": "https://harrypotter.fandom.com/wiki/Ronald_Weasley",
      "@type": "https://schema.org/Person",
      "https://schema.org/givenName": "Ronald"
    }
  ],
  "https://schema.org/alumniOf": {
    "@type": "https://schema.org/Organization",
    "https://schema.org/name": "Hogwarts School of Witchcraft and Wizardry",
    "https://schema.org/logo": {
      "@id": "https://bit.ly/3kDpyDf"
    },
    "https://schema.org/slogan": {
      "@value": "Draco Dormiens Nunquam Titillandus",
      "@language": "la"
    }
  }
}
```

Here are a few noteworthy differences from N-Triples:

1. Our subjects are represented by objects (lines 1, 10, 19, and 25) and the subjects' IRI is specified by the `@id` keyword, avoiding the need to repeat it in every triple. For our blank node (line 25), we just leave off `@id` entirely.
1. We get shorthand for specifying the type of a node via the `@type` keyword. A caveat for literal nodes is that the value becomes an object with the `@type` and `@value` keywords, the latter holding the literal value (lines 5 and 14).
1. Since the value of the `logo` property (line 28) is an IRI, we need to wrap it in an object and use the `@id` keyword. The logo is effectively another resource, but there are no triples where it's the subject.
1. Similar to the typed literal node, we use the `@language` keyword (line 33) for specifying the language of a string.

There are however still some oddities about the JSON that make it difficult to write code against, primarily the use of IRIs for property names. Luckily, a big part of JSON-LD is making RDF easier to consume in code by giving us a lot of syntactic constructs to make this feel more like idiomatic JSON.

Let's go through a few features that will effectively [compact](https://www.w3.org/TR/json-ld-api/#compaction-algorithm) our JSON-LD into something more usable in our programming language of choice.

### Aliasing Predicates

To solve the issue of IRI property names, we can create a dictionary of property names to predicate IRIs. We do so via the `@context` keyword:

```json
{
  "@context": {
    "alumniOf": "https://schema.org/alumniOf",
    "birthday": "http://xmlns.com/foaf/0.1/birthday",
    "givenName": "https://schema.org/givenName",
    "knows": "https://schema.org/knows",
    "logo": "https://schema.org/logo",
    "name": "https://schema.org/name",
    "slogan": "https://schema.org/slogan"
  },
  "@id": "https://harrypotter.fandom.com/wiki/Neville_Longbottom",
  "@type": "https://schema.org/Person",
  "givenName": "Neville",
  "birthday": {
    "@type": "http://www.w3.org/2001/XMLSchema#date",
    "@value": "1980-07-30"
  },
  "knows": [
    {
      "@id": "https://harrypotter.fandom.com/wiki/Luna_Lovegood",
      "@type": "https://schema.org/Person",
      "givenName": "Luna",
      "birthday": {
        "@type": "http://www.w3.org/2001/XMLSchema#date",
        "@value": "1981-02-13"
      }
    },
    {
      "@id": "https://harrypotter.fandom.com/wiki/Ronald_Weasley",
      "@type": "https://schema.org/Person",
      "givenName": "Ronald"
    }
  ],
  "alumniOf": {
    "@type": "https://schema.org/Organization",
    "name": "Hogwarts School of Witchcraft and Wizardry",
    "logo": {
      "@id": "https://bit.ly/3kDpyDf"
    },
    "slogan": {
      "@value": "Draco Dormiens Nunquam Titillandus",
      "@language": "la"
    }
  }
}
```

If this is the only change we made, this would already be significantly easier to use, but let's explore some of the other things we can do.

### Compact IRIs

Since we have several terms from the same vocabulary, we can avoid having to repeat the base IRI for every term by utilizing [compact IRIs](https://www.w3.org/TR/json-ld/#compact-iris):

```json
{
  "@context": {
    "schema": "https://schema.org/",
    "foaf": "http://xmlns.com/foaf/0.1/",
    "alumniOf": "schema:alumniOf",
    "birthday": "foaf:birthday",
    "givenName": "schema:givenName",
    "knows": "schema:knows",
    "logo": "schema:logo",
    "name": "schema:name",
    "slogan": "schema:slogan"
  }
  // ...
}
```

Here, we simply define prefixes `schema` and `foaf` (lines 3 and 4) and then replace the base IRI in our term definitions with `{prefix}:`.

Note the trailing slash in the prefix definitions. This is very important since JSON-LD processors do a literal text replacement on [expansion](https://www.w3.org/TR/json-ld-api/#iri-expansion).

### Aliasing Node Types

Similarly to aliasing predicates, we can also alias node types:

```json
{
  "@context": {
    "schema": "https://schema.org/",
    "foaf": "http://xmlns.com/foaf/0.1/",
    "alumniOf": "schema:alumniOf",
    "birthday": "foaf:birthday",
    "givenName": "schema:givenName",
    "knows": "schema:knows",
    "logo": "schema:logo",
    "name": "schema:name",
    "slogan": "schema:slogan",
    "Person": "schema:Person",
    "Organization": "schema:Organization"
  },
  "@id": "https://harrypotter.fandom.com/wiki/Neville_Longbottom",
  "@type": "Person",
  "givenName": "Neville",
  "birthday": {
    "@type": "http://www.w3.org/2001/XMLSchema#date",
    "@value": "1980-07-30"
  },
  "knows": [
    {
      "@id": "https://harrypotter.fandom.com/wiki/Luna_Lovegood",
      "@type": "Person",
      "givenName": "Luna",
      "birthday": {
        "@type": "http://www.w3.org/2001/XMLSchema#date",
        "@value": "1981-02-13"
      }
    },
    {
      "@id": "https://harrypotter.fandom.com/wiki/Ronald_Weasley",
      "@type": "Person",
      "givenName": "Ronald"
    }
  ],
  "alumniOf": {
    "@type": "Organization",
    "name": "Hogwarts School of Witchcraft and Wizardry",
    "logo": {
      "@id": "https://bit.ly/3kDpyDf"
    },
    "slogan": {
      "@value": "Draco Dormiens Nunquam Titillandus",
      "@language": "la"
    }
  }
}
```

Now we can use the aliases for our `@type` keywords (lines 16, 25, 34, and 39).

### Type Coercion

We can also move the datatype information for certain literals into the terms in the `@context`, utilizing [JSON-LD's type coercion](https://www.w3.org/TR/json-ld/#type-coercion).

```json
{
  "@context": {
    "schema": "https://schema.org/",
    "foaf": "http://xmlns.com/foaf/0.1/",
    "alumniOf": "schema:alumniOf",
    "birthday": {
      "@id": "foaf:birthday",
      "@type": "http://www.w3.org/2001/XMLSchema#date"
    },
    "givenName": "schema:givenName",
    "knows": "schema:knows",
    "logo": {
      "@id": "schema:logo",
      "@type": "@id"
    },
    "name": "schema:name",
    "slogan": "schema:slogan",
    "Person": "schema:Person",
    "Organization": "schema:Organization"
  },
  "@id": "https://harrypotter.fandom.com/wiki/Neville_Longbottom",
  "@type": "Person",
  "givenName": "Neville",
  "birthday": "1980-07-30",
  "knows": [
    {
      "@id": "https://harrypotter.fandom.com/wiki/Luna_Lovegood",
      "@type": "Person",
      "givenName": "Luna",
      "birthday": "1981-02-13"
    },
    {
      "@id": "https://harrypotter.fandom.com/wiki/Ronald_Weasley",
      "@type": "https://schema.org/Person",
      "givenName": "Ronald"
    }
  ],
  "alumniOf": {
    "@type": "Organization",
    "name": "Hogwarts School of Witchcraft and Wizardry",
    "logo": "https://bit.ly/3kDpyDf",
    "slogan": {
      "@value": "Draco Dormiens Nunquam Titillandus",
      "@language": "la"
    }
  }
}
```

For our `birthday` alias (line 6), we use an object instead, throwing the IRI into the `@id` keyword and the datatype into the `@type` keyword as before.

The `logo` alias (line 12) uses a special JSON-LD construct for specifying the corresponding object type as (potentially) an IRI where the `@type` keyword is set to `"@id"`.

Now we can use simple strings for our `birthday` and `logo` fields (lines 24, 30, and 41), instead of needing to wrap them in an object to specify the datatype.

### Default Vocabulary

Many of our terms are coming from Schema.org, so we can shrink our context even further by defining a [default vocabulary](https://www.w3.org/TR/json-ld/#default-vocabulary).

```json
{
  "@context": {
    "@vocab": "https://schema.org/",
    "foaf": "http://xmlns.com/foaf/0.1/",
    "birthday": {
      "@id": "foaf:birthday",
      "@type": "http://www.w3.org/2001/XMLSchema#date"
    },
    "logo": {
      "@id": "logo",
      "@type": "@id"
    }
  },
  "@id": "https://harrypotter.fandom.com/wiki/Neville_Longbottom",
  "@type": "Person",
  "givenName": "Neville",
  "birthday": "1980-07-30",
  "knows": [
    {
      "@id": "https://harrypotter.fandom.com/wiki/Luna_Lovegood",
      "@type": "Person",
      "givenName": "Luna",
      "birthday": "1981-02-13"
    },
    {
      "@id": "https://harrypotter.fandom.com/wiki/Ronald_Weasley",
      "@type": "https://schema.org/Person",
      "givenName": "Ronald"
    }
  ],
  "alumniOf": {
    "@type": "Organization",
    "name": "Hogwarts School of Witchcraft and Wizardry",
    "logo": "https://bit.ly/3kDpyDf",
    "slogan": {
      "@value": "Draco Dormiens Nunquam Titillandus",
      "@language": "la"
    }
  }
}
```

We replace the `schema` prefix with the `@vocab` keyword, defining our default vocabulary for predicates and node types. Now we can drop all the terms from Schema.org without losing any semantic info. We keep `logo` to specify that the value is an IRI, but notice that the `@id` no longer needs the prefix.

### Type-Scoped Contexts

Another useful feature I'd like to demonstrate is [type-scoped contexts](https://www.w3.org/TR/json-ld/#dfn-type-scoped-context). While these aren't absolutely necessary for every JSON-LD document, they can help us namespace our terms for particular types. Here's how they would look in our example:

```json
{
  "@context": {
    "@vocab": "https://schema.org/",
    "Person": {
      "@id": "Person",
      "@context": {
        "foaf": "http://xmlns.com/foaf/0.1/",
        "birthday": {
          "@id": "foaf:birthday",
          "@type": "http://www.w3.org/2001/XMLSchema#date"
        }
      }
    },
    "Organization": {
      "@id": "Organization",
      "@context": {
        "logo": {
          "@id": "logo",
          "@type": "@id"
        }
      }
    }
  }
  // ...
}
```

To create a type-scoped context, we nest our terms in a `@context` (lines 6 and 16) that is part of the definition of our type terms (lines 4 and 14). The IRIs for our types are placed in a nested `@id` keyword (lines 5 and 15; no prefix required thanks to our default vocab).

The primary advantage we gain here is that we keep terms separated, allowing us to have different definitions for the same term depending on the type.

### Remote Contexts

Finally, we don't have to embed our context into our document. We can simply reference the URL of a remote context. Allowing other JSON-LD documents to reuse or [import](https://www.w3.org/TR/json-ld/#imported-contexts) the `@context`, as well as enable caching to reduce the payload size.

```json
{
  "@context": "https://gist.githubusercontent.com/dillonredding/b962efcfe8811a8fe4c46929ef57b9d4/raw/a82c71446e95dd77b042760a38689cd20df93666/remote-context.json"
  // ...
}
```

## Summary

In this guide, we learned about RDF triples, described a graph using N-Triples, converted that to JSON-LD, and explored several syntactic features of JSON-LD. We covered a lot of ground and still only scratched the surface of what's possible.

If you want to learn more, click on any of the links in this article and they should take you to worthwhile documentation. I also recommend experimenting in [the JSON-LD playground](https://json-ld.org/playground/).

If you made it this far, thank you so much for reading!
