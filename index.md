# Welcome to my Blog!

> "Stay awhile and listen!"<br>
> — Deckard Cain

This is where I get my ideas out of my head and onto "paper", exploring, rambling about, and generally nerding out about software development.

{% for post in site.posts %}

<hr/>
<h2>
  <a href="{{ post.url }}">{{ post.title }}</a>
</h2>
<p class="excerpt">{{ post.excerpt }}</p>
<p>Published on {{ post.date | date: "%b %e, %Y" }}</p>

{% endfor %}
