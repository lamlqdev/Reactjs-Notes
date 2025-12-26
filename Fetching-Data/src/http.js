export async function fetchAvailable() {
  const response = await fetch("http://localhost:3000/places");
  const resData = await response.json();
  if (!response.ok) {
    throw new Error("Failed to fetch place!");
  }

  return resData.places;
}

export async function fetchSelectedPlace() {
  const response = await fetch("http://localhost:3000/user-places");
  const resData = await response.json();
  if (!response.ok) {
    throw new Error("Failed to fetch selected place!");
  }

  return resData.places;
}

export async function updateUserPlace(places) {
  const response = await fetch("http://localhost:3000/user-places", {
    method: "PUT",
    body: JSON.stringify({ places: places }),
    headers: {
      "Content-type": "application/json",
    },
  });

  const resData = response.json();
  if (!response.ok) {
    throw new Error("Failed to update user place!");
  }

  return resData.message;
}
