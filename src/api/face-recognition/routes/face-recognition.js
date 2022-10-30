module.exports =  {
  routes: [
    {
      method: 'POST',
      path: '/faces/searches',
      handler: 'face-recognition.findFace',
      config: {
        policies: []
      }
    }
  ]
}
