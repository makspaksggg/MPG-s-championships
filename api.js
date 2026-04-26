function getApi() {
  const URL = 'https://script.google.com/macros/s/AKfycbzCCl5T5BF9KogeU-VHUimSle93DylP0di6rThOJAqLMRaPnPRgNVC6mk2JnLYX1dJD/exec';
  return {
    call: async (action, params = {}) => {
      params.action = action;
      const resp = await fetch(URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      return await resp.json();
    }
  };
}