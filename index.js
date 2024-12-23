addEventListener("handler", async (event) => {
  const bodyObject = event.request.json();

  if (!bodyObject.isRead && !bodyObject.isWrite) {
    return event.respondWith(
      new HttpResponseBuilder().body("Nothing to do").build()
    );
  }

  const {
    gdnKey,
    gdnUrl,
    gdnFabric,
    gdnCollection,
    newDocumentBody,
    existingDocumentKey,
  } = bodyObject;
  let gdnDocumentKey;
  let result = "";

  if (bodyObject.isWrite) {

    const gdnApiEndpoint = `${gdnUrl}/_fabric/${gdnFabric}/_api/document/${gdnCollection}`;

    try {
      const response = await new HttpRequestBuilder(gdnApiEndpoint)
        .method(HttpMethod.POST)
        .header("Authorization", `apikey ${gdnKey}`)
        .body(JSON.stringify(newDocumentBody))
        .build()
        .send();
        
      if (response.status === 202) {
        return event.respondWith(
          new HttpResponseBuilder()
            .status(response.status)
            .body(`Document succesfully created`)
            .build()
        );
      } else if (response.status === 401 || response.status === 403) {
        return event.respondWith(
          new HttpResponseBuilder()
            .status(response.status)
            .body("Authentication or authorization failed.")
            .build()
        );
      } else {
        return event.respondWith(
          new HttpResponseBuilder()
            .status(response.status)
            .body(`Failed to save data to GDN. Status code:`)
            .build()
        );
      }
    } catch (error) {
      return event.respondWith(
        new HttpResponseBuilder()
          .status(500)
          .body(`Failed to send request to GDN API: ${error.message}`)
          .build()
      );
    }
  } else {
    gdnDocumentKey = existingDocumentKey;
  }

  if (bodyObject.isRead) {
    const gdnApiEndpoint = `${gdnUrl}/_fabric/${gdnFabric}/_api/document/${gdnCollection}/${gdnDocumentKey}`;

    try {
      const response = await new HttpRequestBuilder(gdnApiEndpoint)
        .method(HttpMethod.GET)
        .header("Authorization", `apikey ${gdnKey}`)
        .build()
        .send();

      if (response.status === 200) {
        result = response.json();
      } else if (response.status === 401 || response.status === 403) {
        return event.respondWith(
          new HttpResponseBuilder()
            .status(response.status)
            .body("Authentication or authorization failed.")
            .build()
        );
      } else {
        return event.respondWith(
          new HttpResponseBuilder()
            .status(response.status)
            .body(
              `Failed to retrieve data from GDN. Status code: ${response.status}`
            )
            .build()
        );
      }
    } catch (error) {
      return event.respondWith(
        new HttpResponseBuilder()
          .status(500)
          .body(`Failed to send request to GDN API: ${error.message}`)
          .build()
      );
    }
  }

  return event.respondWith(new HttpResponseBuilder().body(result).build());
});