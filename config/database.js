module.exports = {
  url : 'mongodb://' 
  + (process.env.MNG_USR ||'user')
  + ':'
  + (process.env.MNG_PWD ||'password')
  + '@localhost/cirkled'
}