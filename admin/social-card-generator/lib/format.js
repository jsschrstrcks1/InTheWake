const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function formatBylineDate(iso) {
  if (!iso) return '';
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return '';
  const [, y, mm, dd] = m;
  return `${parseInt(dd, 10)} ${MONTHS[parseInt(mm, 10) - 1]} ${y}`;
}

export function buildByline(name, isoDate) {
  const d = formatBylineDate(isoDate);
  return d ? `${name}  ·  ${d}` : name;
}
