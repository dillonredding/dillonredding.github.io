{% for post in site.posts %}

<hr/>
<h1>
  <a href="{{ post.url }}">{{ post.title }}</a>
</h1>
<p class="summary">{{ post.summary }}</p>
<p>Published on {{ post.published_on }}</p>

{% endfor %}
