interface Body {
  query: string;
}

export const server = {
  fetch: async (body: Body) => {
    const res = await fetch("/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    return res.json();
  }
};
