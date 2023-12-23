const GALLERY_URL =
  "https://api.buildingshistory.co.uk/api/v1/images/?gallery_id=985e3f6d-09f1-4a0f-8cbf-060514ecb860";

export const fetchGallery = async () => {
  const request = await fetch(GALLERY_URL);
  const data = await request.json();
  return data;
};
