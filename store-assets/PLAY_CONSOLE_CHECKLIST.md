# Google Play Console Release Checklist

## Before creating the app

- Confirm final app name and permanent package ID.
- Confirm the public developer/support email.
- Create or verify a Google Play Developer account and complete identity verification.
- Enroll in Play App Signing when the app is created.

## App setup

1. Create app: English (United States), App, Free.
2. Enter the English title, short description, and full description from `metadata/en-US`.
3. Upload the 512×512 icon and 1024×500 feature graphic.
4. Upload at least two phone screenshots from the signed Android build.
5. Set category to Music & Audio.
6. Add privacy policy URL: `https://kokoro351.github.io/resonance-preview/privacy.html`.
7. Complete App access: all functionality is available without special access.
8. Complete Ads: the app contains no ads.
9. Complete Data Safety using the draft in `STORE_LISTING.md`.
10. Complete Target audience: ages 13+; the app is not specifically designed for children.
11. Complete Content rating questionnaire accurately (no violence, sexuality, language, gambling, or user-generated content).

## Testing and production

- Upload the signed AAB to Internal testing first.
- Run the Play pre-launch report and review crashes, ANRs, accessibility, and rendering.
- For a personal developer account created after November 13, 2023, run a Closed test with at least 12 opted-in testers for 14 continuous days before applying for production access.
- Keep tester feedback and a record of changes made from that feedback.
- Apply for production access, answer the testing/production-readiness questions, then submit the production release for review.

## Release artifact

- Expected file: `android/app/build/outputs/bundle/release/app-release.aab`
- Version name: `1.0`
- Version code: `1`
