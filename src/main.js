const content = document.getElementById('main-content')
const dateInput = document.getElementById('date-input')
const btnPrev = document.getElementById('btn-prev')
const btnNext = document.getElementById('btn-next')
const btnRandom = document.getElementById('btn-random')

const MIN_DATE = '1995-06-16'

function todayET() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(new Date())
}

function stripTags(html) {
  return html ? html.replace(/<[^>]*>/g, '') : ''
}

function shiftDate(dateString, delta) {
  const d = new Date(dateString + 'T12:00:00')
  d.setDate(d.getDate() + delta)
  const result = d.toISOString().split('T')[0]
  if (result < MIN_DATE) return MIN_DATE
  const max = todayET()
  if (result > max) return max
  return result
}

async function loadAPOD(dateString) {
  content.innerHTML = '<p class="loading">Loading&#8230;</p>'
  dateInput.value = dateString
  dateInput.max = todayET()
  btnPrev.disabled = dateString === MIN_DATE
  btnNext.disabled = dateString === todayET()

  const url = new URL(window.location.href)
  url.searchParams.set('date', dateString)
  history.pushState({ date: dateString }, '', url)

  try {
    const todayMs = new Date(todayET() + 'T12:00:00').getTime()
    const targetMs = new Date(dateString + 'T12:00:00').getTime()
    let page = Math.round((todayMs - targetMs) / 86400000) + 1
    let data = null

    for (let i = 0; i < 8; i++) {
      const response = await fetch(
        `https://science.nasa.gov/wp-json/wp/v2/apod-basic?per_page=1&page=${Math.max(1, page)}`
      )
      if (!response.ok) throw new Error('Request failed (' + response.status + ')')

      const raw = await response.json()
      const entry = Array.isArray(raw) ? raw[0] : raw
      if (!entry) { page -= 10; continue }

      if (entry.date === dateString) {
        data = entry
        break
      }

      const diff = Math.round(
        (new Date(entry.date + 'T12:00:00').getTime() - targetMs) / 86400000
      )
      page += Math.abs(diff) <= 10 ? (diff > 0 ? 1 : -1) : diff
    }

    if (!data) {
      content.innerHTML = '<p class="error">Could not find this date in the archive.</p>'
      return
    }

    if (data.media_type === 'image') {
      data.url = data.hdurl
    } else if (data.media_type === 'video') {
      const match = data.basic_html?.match(/iframe[^>]*src="([^"]*)"/)
      if (match) data.url = match[1].startsWith('//') ? 'https:' + match[1] : match[1]
    }

    let media
    if (data.media_type === 'image') {
      media = '<img src="' + data.url + '" alt="' + data.title + '" />'
    } else if (data.url && (data.url.includes('youtube') || data.url.includes('vimeo'))) {
      media = '<iframe src="' + data.url + '" title="' + data.title + '" allowfullscreen></iframe>'
    } else {
      media = '<video src="' + data.url + '" controls></video>'
    }

    const credit = stripTags(data.copyright || data.credit) || 'NASA'
    const explanation = stripTags(data.explanation)
    const plateDate = 'PLATE ' + data.date.replace(/-/g, '·')

    content.innerHTML =
      '<div class="hero">' + media + '</div>' +
      '<section class="info">' +
        '<div class="meta">' +
          '<span class="plate">' + plateDate + '</span>' +
          '<span>' + credit + '</span>' +
        '</div>' +
        '<h1>' + data.title + '</h1>' +
        '<p>' + explanation + '</p>' +
      '</section>'
  } catch (err) {
    content.innerHTML = '<p class="error">Error: ' + err.message + '</p>'
  }
}

btnPrev.addEventListener('click', () => {
  const prev = shiftDate(dateInput.value, -1)
  if (prev !== dateInput.value) loadAPOD(prev)
})

btnNext.addEventListener('click', () => {
  const next = shiftDate(dateInput.value, 1)
  if (next !== dateInput.value) loadAPOD(next)
})

btnRandom.addEventListener('click', () => {
  const min = new Date(MIN_DATE + 'T12:00:00').getTime()
  const max = new Date(todayET() + 'T12:00:00').getTime()
  const rand = new Date(min + Math.random() * (max - min)).toISOString().split('T')[0]
  loadAPOD(rand)
})

dateInput.addEventListener('change', (e) => {
  if (e.target.value) loadAPOD(e.target.value)
})

document.addEventListener('keydown', (e) => {
  if (e.target.matches('input')) return
  if (e.key === 'ArrowLeft') btnPrev.click()
  if (e.key === 'ArrowRight') btnNext.click()
})

window.addEventListener('popstate', (e) => {
  const date = e.state?.date || new URLSearchParams(window.location.search).get('date') || todayET()
  loadAPOD(date)
})

const startDate = new URLSearchParams(window.location.search).get('date') || todayET()
loadAPOD(startDate)
