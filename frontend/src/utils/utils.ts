export function capitalizeFirstLetter(val: string) {
  return val.charAt(0).toUpperCase() + val.slice(1)
}

export function formatDate(date: any) {
  var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear()

  if (month.length < 2) month = '0' + month
  if (day.length < 2) day = '0' + day

  return [day, month, year].join('/')
}
