# Welcome to my Blog!

> "Stay awhile and listen!"
>
> — Deckard Cain

This is where I get ideas out of my head and onto "paper" by rambling about and exploring all things software development. If a post piques your interest and you'd like to see more, feel free to hit me up on Twitter [@dillon_redding](https://twitter.com/dillon_redding) or [open an issue on GitHub](https://github.com/dillonredding/dillonredding.github.io/issues/new).

---

<ul>
  {% for post in site.posts %}
    <li>
      <a href="{{ post.url }}">{{ post.title }}</a>
    </li>
  {% endfor %}
</ul>
