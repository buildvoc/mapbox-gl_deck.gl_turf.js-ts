const GALLERY_URL =
  "https://api.buildingshistory.co.uk/api/v1/images/?gallery_id=4bc06f4d-b4ec-42c6-a641-a2666d3e5f1f";

export const fetchGallery = async () => {
  const request = await fetch(GALLERY_URL);
  const data = await request.json();
  return data;
};
