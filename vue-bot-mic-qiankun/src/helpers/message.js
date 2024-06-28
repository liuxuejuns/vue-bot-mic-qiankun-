
export const getBotResponse = async messages => {
  const options = {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.6,
      stream: true
    })
  }
  try {
    const response = await fetch('http://10.34.60.105:8889/v1/chat/completions', options)
    if (response.body) {
      return response
    }
  } catch (error) {
    return '配置异常'
  }
}
