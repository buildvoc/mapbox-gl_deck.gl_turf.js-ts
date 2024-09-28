let endpoint="https://api.pic2bim.co.uk/"

export const get_photo = async (photo_id: number) => {
  "use server";

  try {
    const response = await fetch(
      `${endpoint}comm_get_photo.php?photo_id=${photo_id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    let res: any = await response.json();
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    if (res.photo) {
      return res?.photo;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Failed to fetch the catalogue:", error);
    return [];
  }
};

export const get_unassigned_photos = async (user_id: number) => {
  "use server";

  try {
    const response = await fetch(
      `${endpoint}comm_unassigned.php?user_id=${user_id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    let res: any = await response.json();
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    if (res.photos_ids) {
      return res?.photos_ids;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Failed to fetch the catalogue:", error);
    return [];
  }
};
