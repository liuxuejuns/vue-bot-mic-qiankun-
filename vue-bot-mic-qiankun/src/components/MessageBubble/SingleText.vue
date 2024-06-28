<template>
  <div class="qkb-msg-bubble-component qkb-msg-bubble-component--single-text">
    <div v-if="mainData.type === 'text'" class="qkb-msg-bubble-component__text">
      {{ mainData.text }}
    </div>
    <div
      v-if="mainData.type === 'button'"
      class="qkb-msg-bubble-component__text"
      v-html="mainData.text"
    ></div>
        <div
          v-if="mainData.type === 'html'"
          class="markdown-body"
          v-html="transformHtml"
        ></div>
  </div>
</template>
<script>
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import mila from 'markdown-it-link-attributes'
import mdKatex from '@traptitech/markdown-it-katex'

function highlightBlock (str, lang) {
  return `<pre class="code-block-wrapper"><div class="code-block-header"><span class="code-block-header__lang">${lang}</span></div><code class="hljs code-block-body ${lang}">${str}</code></pre>`
}

const mdi = new MarkdownIt({
  html: false,
  linkify: true,
  highlight (code, language) {
    const validLang = !!(language && hljs.getLanguage(language))
    if (validLang) {
      const lang = language ?? ''
      return highlightBlock(
        hljs.highlight(code, { language: lang }).value,
        lang
      )
    }
    return highlightBlock(hljs.highlightAuto(code).value, '')
  }
})

mdi.use(mila, { attrs: { target: '_blank', rel: 'noopener' } })
mdi.use(mdKatex, {
  blockClass: 'katexmath-block rounded-md p-[10px]',
  errorColor: ' #cc0000'
})
export default {
  props: {
    mainData: {
      type: Object
    }
  },
  computed: {
    transformHtml () {
      const value = this.mainData.text ?? ''
      return mdi.render(value)
    }
  }
}
</script>
