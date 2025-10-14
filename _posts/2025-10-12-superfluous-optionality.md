---
title: Superfluous Optionality
excerpt: How to use idiomatic Kotlin over Arrow's Option type
tags: kotlin
---

[Arrow’s `Option<A>` type](https://apidocs.arrow-kt.io/arrow-core/arrow.core/-option/index.html) allows us to represent a potentially absent value, but why would you use `Option` for that? Kotlin has natively supported this from the beginning with nullable types. An `Option<A>` has two subtypes: `Some<A>` for representing a value and `None` for representing the _absence_ of a value. This is exactly what nullable types are for though. A `String?`, for example, can hold a value such as `“foo”` or no value (`null`). This isomorphism of `Option<String>` and `String?` is easily demonstrated with a couple of simple tests:

```kotlin
@ParameterizedTest
@EmptySource
@ValueSource(strings = {" ", "foo", "bar baz"})
fun `Some is equivalent to non-null`(value: String) {
    val option = value.toOption()
    assertIs<Some<*>>(option)
    assertTrue { option.getOrNull() == value }
}

@Test
fun `None is equivalent to null`() {
    val option = null.toOption()
    assertIs<None>(option)
    assertNull(option.getOrNull())
}
```

The first test shows how `Some<String>` is equivalent to `String` by simply wrapping a `String` in an `Option<String>` and asserting that it unwraps to the same `String`. And because `Option` is a generic container, this equivalence extends to any `Option<A>` and `A?`. In the second test, we prove the equivalence of `null` and `None` using the same approach.

Those tests may not seem like much, but they establish a baseline for further equivalence testing. Indeed, the whole point of using `Option` is its methods and extension functions that exhibit polymorphic behavior based on the subtype. Let’s start with the oft used `Option.map`. In Kotlin, we achieve the same functionality with the safe-call operator `?.` and the `let` [scope function](https://kotlinlang.org/docs/scope-functions.html). We can prove this by applying a function to a nullable value using both the `Option` and idiomatic Kotlin approaches, and ensuring the results match.

```kotlin
@ParameterizedTest
@NullAndEmptySource
@ValueSource(strings = {" ", "foo", "bar baz"})
fun `map is equivalent to let`(nullableValue: String?) {
    fun emphasize(value: String) = "$value!!!"

    val optionalResult = nullableValue.toOption().map(::emphasize)
    val nullableResult = nullableValue?.let(::emphasize)

    assertTrue { optionalResult.getOrNull() == nullableResult }
}
```

Additionally, `?.let` covers `Option.flatMap` since nullable types don’t suffer from the nesting issue that `Option` does. That is, when our `map` function might return an `Option<B>`, we can instead use `flatMap` instead to avoid the whole `Option<Option<B>>` rigamarole. We don’t need to make that distinction with `?.let`. We can simply return another nullable value.

Another useful method is `Option.filter`, which can be accomplished with the `takeIf` scope function. Again, we can prove this using a similar approach as a above, this time applying a predicate to a nullable value using both approaches.

```kotlin
@ParameterizedTest
@NullAndEmptySource
@ValueSource(strings = {" ", "foo", "bar baz"})
fun `filter is equivalent to takeIf`(nullableValue: String?) {
    val predicate = String::isNotEmpty

    val optionalResult = nullableValue.toOption().filter(predicate)
    val nullableResult = nullableValue?.takeIf(predicate)

    assertTrue { optionalResult.getOrNull() == nullableResult }
}
```

The complement of `filter` is `filterNot`, a useful means of inverting our predicate, and for that we have the `takeUnless` scope function. I leave the test for the equivalence of `filterNot` and `takeUnless` as an exercise.

Eventually, we’ll have to extract whatever’s inside the `Option` if we want to do anything with the value, if it’s there. We’ve been doing so with `getOrNull`, but there’s also the cryptically named `recover` function that “recovers” from `None` using the result of the given function. It’s effectively `map` for `None`. However, this is precisely what the Elvis operator does. You know the drill by now.

```kotlin
@ParameterizedTest
@NullAndEmptySource
@ValueSource(strings = {" ", "foo", "bar baz"})
fun `recover is equivalent to the Elvis operator`(nullableValue: String?) {
    val fallback = "Must be null..."

    val optionalResult = nullableValue.toOption().recover { fallback }
    val nullableResult = nullableValue ?: fallback

    assertTrue { optionalResult.getOrNull() == nullableResult }
}
```

There’s a similar function called `getOrElse`, the main difference being that it unwraps the `Option` for us. We don’t need to make this distinction with the Elvis operator. Again, I leave this as an exercise.

Now let’s take a look at `Option.fold`. This method combines the functionality of `map` and `getOrElse` by accepting two functions: an `(A) -> B` in the case of `Some<A>` and a `() -> B` in the case of `None`. We can accomplish the same behavior in vanilla Kotlin with smart-casting and an `if`-`else` expression.

```kotlin
@ParameterizedTest
@NullAndEmptySource
@ValueSource(strings = {" ", "foo", "bar baz"})
fun `fold is equivalent to smart-casting`(nullableValue: String?) {
	  val resultFromOptional = nullableValue.toOption().fold(
		    { "null" },
		    { "not null" }
    )
    val resultFromNullable = if (nullableValue == null) "null" else "not null"

    assertTrue { resultFromOptional == resultFromNullable }
}
```

Finally, let’s consider `Option.onNone`, which runs a given function when there is no value. Kotlin has a nifty little trick for this combining the Elvis operator and the `run` scope function.

```kotlin
@ParameterizedTest
@NullAndEmptySource
@ValueSource(strings = {" ", "foo", "bar baz"})
fun `onNone is equivalent to run-on-null`(nullableValue: String?) {
    data class HasRun(val nullable: Boolean = false, val optional: Boolean = false)

    var hasRun = HasRun()

    nullableValue.toOption().onNone { hasRun = hasRun.copy(optional = true) }
    nullableValue ?: run { hasRun = hasRun.copy(nullable = true) }

    assertTrue { hasRun.nullable == hasRun.optional }
}
```

There’s corollary method called `onSome` that runs a function that accepts the value in the `Option`. We’ve already seen how to do this with smart-casting, but `?.also` provides a more functional approach.

## Summary

Here’s a quick review the various ways of using plain Kotlin over `Option`:

1. Use `?.let` instead of `map` and `flatMap`.
2. Use `?.takeIf` and `?.takeUnless` instead of `filter` and `filterNot`, respectively.
3. Use `?:` instead of `recover` and `getOrElse`.
4. Use smart casting instead of `fold`.
5. Use `?.also` (or smart casting) instead of `onSome`.
6. Use `?: run` instead of `onNone`.
7. Bonus: Use standard `null` checks instead of `isSome` and `isNone`.

By preferring common Kotlin language constructs and the `kotlin-stdlib` for handling nullable types, we improve readability of our codebase. Engineers are more likely to understand the core language and standard library than _any_ third-party library. Furthermore, we reduce the learning curve for new devs that may not be familiar with Arrow, let alone highly abstract functional programming concepts. Not that there’s anything wrong with those, they can just feel alien, especially in a language that already supports them but in different terms.

If I still haven’t convinced you, at least consider this. Limit your use of `Option` to the peripheries of your application. Do _not_ use it for private, internal libraries or domain-level code. Once those APIs start utilizing `Option`, there’s no going back. It will start to pollute your codebase, creating a dependency on a library you neither own nor control. There is a potential cost if there’s ever a major upgrade to, or deprecation of, the library.
