export async function sendRequestToGoogleCloudApi(
    // tslint:disable-next-line:no-any Need to be able to serialize anything.
    endpoint: string, request: any, apikey: string, method = 'POST') {
  const endpointWithParam = endpoint + '?key=' + apikey;
  const response = await fetch(endpointWithParam, {
    method,
    mode: 'cors',
    cache: 'no-cache',
    body: method === 'POST' ? JSON.stringify(request) : undefined,
  });

  const text = await response.text();
  // tslint:disable:no-any no-unnecessary-type-assertion
  return JSON.parse(text) as any;
  // tslint:enable:no-any no-unnecessary-type-assertion
}
