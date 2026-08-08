export async function fetchAvailable() {
  const response = await fetch("http://localhost:3000/places");

  if (!response.ok) {
    throw new Error("Failed to fetch place!");
  }

  const resData = await response.json();
  return resData.places;
}

export async function fetchSelectedPlace() {
  const response = await fetch("http://localhost:3000/user-places");

  if (!response.ok) {
    throw new Error("Failed to fetch selected place!");
  }

  const resData = await response.json();
  return resData.places;
}

export async function updateUserPlace(places) {
  const response = await fetch("http://localhost:3000/user-places", {
    method: "PUT",
    body: JSON.stringify({ places }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to update user place!");
  }

  const resData = await response.json();
  return resData.message;
}
