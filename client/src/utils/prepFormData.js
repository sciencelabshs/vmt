export const prepFormData = (body) => {
  let formData = new FormData();
  for (let file of body.ggbFiles) {
    formData.append('ggb', file)
  }
  console.log(formData)
  return formData;
}