# Instagram and Threads publishing

This skill produces a publish-ready package by default. Actual publishing is a separate, explicit action because it changes an external account and requires Meta authorization.

## Instagram

For an Instagram professional account, the Meta flow is:

1. Host each final image at a public HTTPS URL that Meta can fetch.
2. Create one media container per carousel item with `is_carousel_item=true`.
3. Create the parent carousel container with the child container IDs and caption.
4. Publish the parent container after the visual QA pass.

Use the [Instagram content publishing documentation](https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/content-publishing/) and the [official Meta Postman collection](https://www.postman.com/meta/instagram/request/23987686-f4b5a72d-a125-4088-8968-93de1a549e68) for the current endpoint, permissions, and version. Do not hardcode a token, account ID, or API version in this skill.

## Threads

For Threads, the Meta flow is:

1. Create a Meta app with the Threads use case and authorize the account.
2. Create a text, image, or carousel container through `/me/threads`.
3. Publish it through `/me/threads_publish` using the returned creation ID.
4. If a carousel is unavailable for the account or media shape, use the generated `root` post plus short `replies` as the safe fallback.

Check the [official Threads API collection](https://www.postman.com/meta/threads/documentation/dht3nzz/threads-api?entity=request-34203612-ee0a2365-9d95-4cbe-8087-1cfb04d38c05) and [Threads developer documentation](https://developers.facebook.com/docs/threads/) immediately before implementing or running a publisher. Permissions, limits, and supported media types can change.

## Local handoff

Keep credentials outside the repository. A future publisher may read environment variables such as `META_ACCESS_TOKEN`, `IG_USER_ID`, and `THREADS_USER_ID`, but it must validate their presence without printing values. Never add credential files to the card-news output folder, commit them, or send a publish request during visual QA.
