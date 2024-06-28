<template lang="pug">
#app
  VueChatBot(
    :options="botOptions",
    :messages="messageData",
    :bot-typing="botTyping",
    :input-disable="inputDisable",
    :is-open="false",
    @init="botStart",
    @msg-send="msgSend",
    ref="chatBotRef"
  )
</template>
<script>
import BotIcon from './assets/icons/bot.png'
import { VueChatBot } from './vue-chat-bot'
import { getBotResponse } from './helpers/message'
import actions from './helpers/actions'

export default {
  components: {
    VueChatBot
  },

  data () {
    return {
      messageData: [], // 聊天记录数据
      botTyping: false, // 机器人正在输入的状态
      inputDisable: false, // 控制聊天输入框是否可用

      // 机器人基本配置 控制聊天机器人的外观、行为
      botOptions: {
        botAvatarImg: BotIcon,
        boardContentBg: '#f4f4f4',
        msgBubbleBgBot: '#fff',
        inputPlaceholder: 'Type here...',
        inputDisableBg: '#fff',
        inputDisablePlaceholder: 'Hit the buttons above to respond'
      }
    }
  },
  mounted () {
    actions.onGlobalStateChange((state) => {
      // console.log('\x1b[32m%s\x1b[0m', '我是子应用，我检测到数据了', state)
      if (state?.msg && state.msg.trim() !== '' && !this.botTyping) {
        this.messageData = []
        this.$refs.chatBotRef.openBotview()
        this.msgSend({ text: state.msg })
      }
    }, true) // onGlobalStateChange的第二个参数设置为true，则会立即触发一次观察者函数
  },

  methods: {
    botStart () {
      // 初始化机器人
      this.botTyping = true
      setTimeout(() => {
        this.botTyping = false
        this.messageData.push({
          agent: 'bot',
          type: 'button',
          text: '欢迎使用本机器人，如有任何问题可以通过下方联系我们',
          options: [
            {
              'text': 'Sean TS Wang',
              'value': 'sip:Sean_TS_Wang@wistron.com',
              'action': 'url'
            },
            {
              'text': 'Fan Wang',
              'value': 'sip:Fan_Wang@wistron.com',
              'action': 'url'
            }
          ]
        })
      }, 1000)
    },

    msgSend (value) {
      // 发送信息
      this.messageData.push({
        agent: 'user',
        type: 'text',
        text: value.text
      })
      // 获取响应
      this.getResponse()
    },
    appendLastMessageContent (content) {
      this.messageData[this.messageData.length - 1].text += content
    },
    async readStream (reader, status) {
      let partialLine = ''
      const decoder = new TextDecoder('utf-8')
      while (true) {
        // eslint-disable-next-line no-await-in-loop
        const { value, done } = await reader.read()
        if (done) break

        const decodedText = decoder.decode(value, { stream: true })

        if (status !== 200) {
          const json = JSON.parse(decodedText) // start with "data: "
          const content = json.error.message ?? decodedText
          this.appendLastMessageContent(content)
          return
        }

        const chunk = partialLine + decodedText
        const newLines = chunk.split(/\r?\n/)

        partialLine = newLines.pop() ?? ''

        for (const line of newLines) {
          if (line.length === 0) continue // ignore empty message
          if (line.startsWith(':')) continue // ignore sse comment message
          if (line === 'data: [DONE]') return //

          const json = JSON.parse(line.substring(6)) // start with "data: "
          const content =
            status === 200
              ? json.choices[0].delta.content ?? ''
              : json.error.message
          if (!this.botTyping) {
            return
          }
          this.appendLastMessageContent(content)
        }
      }
    },

    // Submit the message from user to bot API, then get the response from Bot
    async getResponse () {
      // Loading
      this.botTyping = true
      this.inputDisable = true
      const openaiNeedData = this.messageData.map(item => {
        if (item.agent === 'bot') {
          return {
            role: 'assistant',
            content: item.text
          }
        } else {
          return {
            role: 'user',
            content: item.text
          }
        }
      })
      this.messageData.push({
        agent: 'bot',
        type: 'html',
        text: ''
      })
      const { body, status } = await getBotResponse(openaiNeedData)
      const reader = body.getReader()
      await this.readStream(reader, status)
      this.botTyping = false
      this.inputDisable = false
    }
  }
}
</script>
<style lang="scss" scoped>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  // text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
