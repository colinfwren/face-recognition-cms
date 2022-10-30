const fetch = require('node-fetch')
const FormData = require('form-data')
const fs = require('fs')

const FACE_RECOGNITION_ADD_URL = 'http://localhost:9000/faces/searches'

module.exports = {
  async findFace(ctx, next) {
    const uploadedFile = ctx.request.files.file
    const uploadedFileStream = fs.createReadStream(uploadedFile.path)
    const formData = new FormData()
    formData.append(
      'file',
      uploadedFileStream,
      {
        contentType: uploadedFile.type,
        mimeType: uploadedFile.type,
        filename: uploadedFile.name
      }
    )
    const response = await fetch(
      FACE_RECOGNITION_ADD_URL,
      {
        method: 'POST',
        body: formData
      }
    )
    if (response.status === 200) {
      const respData = await response.json()
      const foundMediaIds = respData.matches.map(({ image_id }) => parseInt(image_id, 10))
      const [uploads, count] = await strapi.db.query('plugin::upload.file').findWithCount({
        where: {
          id: {
            $in: foundMediaIds
          }
        },
        orderBy: { createdAt: 'ASC'}
      })
      ctx.body = JSON.stringify({ files: uploads, count })
      return
    }
    ctx.body = 'Failed to process image'
  }
}
