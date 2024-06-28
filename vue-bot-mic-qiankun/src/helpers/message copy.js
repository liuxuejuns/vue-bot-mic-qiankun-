
let messageList = [{ role: 'assistant', content: '' }]
const readStream = async (
  reader,
  status
) => {
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
      console.error(content)
      appendLastMessageContent(content)
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
      appendLastMessageContent(content)
      console.clear()
      console.log(messageList[0].content)
    }
  }
}

const appendLastMessageContent = (content) =>
  (messageList[messageList.length - 1].content += content)
export const getBotResponse = async (c) => {
  const options = {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: '快速排序 c优化版本' }],
      temperature: 0.6,
      stream: true
    })
  }
  const { body, status } = await fetch('http://10.34.60.105:8889/v1/chat/completions', options)
  if (body) {
    const reader = body.getReader()
    await readStream(reader, status)
  }
}
