const shinkanData = require('./booklist_2020_04.json')

module.exports = class Shinkan {
  constructor() {
    this.HOST = "";
  }

  fetch() {
      return shinkanData.list
  }

  getShinkanData(){
      const data = this.fetch()
      const isbns = []

      data.map(comic => {
        const isbn = comic[3]
        isbns.push(isbn)
      })
      
      return isbns
  }
}

