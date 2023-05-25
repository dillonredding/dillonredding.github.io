# Posts

{% for post in site.posts %}

<h2>
  <a href="{{ post.url }}">{{ post.title }}</a>
</h2>
<p class="excerpt">{{ post.excerpt }}</p>
<p>Published on {{ post.date | date: "%b %e, %Y" }}</p>
<hr/>

{% endfor %}
