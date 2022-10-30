'use strict';
const fetch = require('node-fetch')
const FormData = require('form-data')

const FACE_RECOGNITION_ADD_URL = 'http://localhost:9000/faces'

async function uploadFileForFaceRecognition(event) {
  const formData = new FormData()
  formData.append('file', event.params.data.getStream())
  formData.append('url', event.params.data.url)
  formData.append('image_id', event.result.id)
  const response = await fetch(FACE_RECOGNITION_ADD_URL, { method: 'POST', body: formData })
  if (response.status === 201) {
    const respData = await response.json()
    return { ids: respData.ids }
  }
  throw new Error('Failed to process face')
}

async function updateFileRecordWithFaceRecognitionId(id) {

}

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }) {
    strapi.db.lifecycles.subscribe({
      models: ['plugin::upload.file'],
      async afterCreate(event) {
        if (event.params.data.mime.indexOf('image/') > -1) {
          try {
            const { ids } = await uploadFileForFaceRecognition(event)
            const updated = await strapi.db.query('plugin::upload.file').update({
              where: { id: event.result.id },
              data: {
                faceRecognitionIds: ids.join(', ')
              }
            })
            strapi.log.debug(`updated record ${updated.ids} with face recognition id ${updated.faceRecognitionIds}`)
          } catch (error) {
            strapi.log.error('Failed to process faces')
          }
        }
      }
    })
  },
};
