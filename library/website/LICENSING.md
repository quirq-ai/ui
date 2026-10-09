# Licensing

## Copied source

Everything under [`source/`](source/) was copied unchanged from [quirq-ai/website](https://github.com/quirq-ai/website) at commit `a66ac87a28cc269c9aa94e4e60b7679a11096c6a`. It keeps the terms it has there, as set out in [website LICENSING.md](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/LICENSING.md):

- quirq's own additions to the website are under the Apache License 2.0, copied here as [LICENSE](LICENSE).
- The quirq name, marks and brand art are not licensed, and all rights are reserved. That includes [`source/src/components/QuirqBrand/`](source/src/components/QuirqBrand/).
- `source/src/components/ui/` is adapted from shadcn/ui under the MIT license. See [LICENSE.shadcn](LICENSE.shadcn), a notice this repository adds and which is not one of the copied files.

## Not copied

The website's code inherited from PostHog is not copied here. PostHog's notice on its site code ([LICENSE.posthog](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/LICENSE.posthog), lines 5 to 7) asks that it not be duplicated or copied, and it grants no permission to copy. The catalogue links to those files in the website instead.

The vendored Blobatar (MIT) and @pierre/trees (Apache-2.0) code is also linked rather than copied. It keeps its own licenses in the website's `src/vendor/`. Whether to copy it is open: see [O3](../DECISIONS.md#o3-vendored-code-and-screenshots-of-posthogs-design).

## Screenshots

The files in [`screenshots/`](screenshots/) are not covered by the Apache-2.0 [LICENSE](LICENSE) beside them. They show the whole site as it runs at that commit, including two things:

- PostHog's window chrome, icons and design, which fall under PostHog's notice above;
- quirq's marks, which are all rights reserved.

They are here for reference only. Whether they may be published in this public repository is open: see [O3](../DECISIONS.md#o3-vendored-code-and-screenshots-of-posthogs-design).
