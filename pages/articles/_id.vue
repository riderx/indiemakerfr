<template>
  <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto">
      <article>
        <a
          class="text-sm font-black tracking-wide text-gray-300 uppercase"
          href="/articles"
        >
          ← Tous les articles
        </a>
        <div class="relative py-16 mt-4 overflow-hidden bg-white">
          <div
            class="hidden lg:block lg:absolute lg:inset-y-0 lg:h-full lg:w-full"
          >
            <div
              class="relative h-full mx-auto text-lg max-w-prose"
              aria-hidden="true"
            >
              <svg
                class="absolute transform translate-x-32 top-12 left-full"
                width="404"
                height="384"
                fill="none"
                viewBox="0 0 404 384"
              >
                <defs>
                  <pattern
                    id="74b3fd99-0a6f-4271-bef2-e80eeafdf357"
                    x="0"
                    y="0"
                    width="20"
                    height="20"
                    patternUnits="userSpaceOnUse"
                  >
                    <rect
                      x="0"
                      y="0"
                      width="4"
                      height="4"
                      class="text-gray-200"
                      fill="currentColor"
                    />
                  </pattern>
                </defs>
                <rect
                  width="404"
                  height="384"
                  fill="url(#74b3fd99-0a6f-4271-bef2-e80eeafdf357)"
                />
              </svg>
              <svg
                class="
                  absolute
                  transform
                  -translate-x-32 -translate-y-1/2
                  top-1/2
                  right-full
                "
                width="404"
                height="384"
                fill="none"
                viewBox="0 0 404 384"
              >
                <defs>
                  <pattern
                    id="f210dbf6-a58d-4871-961e-36d5016a0f49"
                    x="0"
                    y="0"
                    width="20"
                    height="20"
                    patternUnits="userSpaceOnUse"
                  >
                    <rect
                      x="0"
                      y="0"
                      width="4"
                      height="4"
                      class="text-gray-200"
                      fill="currentColor"
                    />
                  </pattern>
                </defs>
                <rect
                  width="404"
                  height="384"
                  fill="url(#f210dbf6-a58d-4871-961e-36d5016a0f49)"
                />
              </svg>
              <svg
                class="absolute transform translate-x-32 bottom-12 left-full"
                width="404"
                height="384"
                fill="none"
                viewBox="0 0 404 384"
              >
                <defs>
                  <pattern
                    id="d3eb07ae-5182-43e6-857d-35c643af9034"
                    x="0"
                    y="0"
                    width="20"
                    height="20"
                    patternUnits="userSpaceOnUse"
                  >
                    <rect
                      x="0"
                      y="0"
                      width="4"
                      height="4"
                      class="text-gray-200"
                      fill="currentColor"
                    />
                  </pattern>
                </defs>
                <rect
                  width="404"
                  height="384"
                  fill="url(#d3eb07ae-5182-43e6-857d-35c643af9034)"
                />
              </svg>
            </div>
          </div>
          <div class="relative px-4 sm:px-6 lg:px-8">
            <div class="mx-auto text-lg max-w-prose">
              <h1>
                <span
                  class="
                    block
                    text-base
                    font-semibold
                    tracking-wide
                    text-center text-indigo-600
                    uppercase
                  "
                  >{{ page.surtitle }}</span
                >
                <span
                  class="
                    block
                    mt-2
                    text-3xl
                    font-extrabold
                    leading-8
                    tracking-tight
                    text-center text-gray-900
                    sm:text-4xl
                  "
                  >{{ page.title }}</span
                >
                <span
                  class="
                    block
                    text-base
                    font-semibold
                    tracking-wide
                    text-center text-indigo-600
                    uppercase
                  "
                  >{{ page.subtitle }}</span
                >
              </h1>
              <p class="mt-8 text-xl leading-8 text-gray-500">
                {{ page.description }}
              </p>
            </div>
            <div class="mx-auto mt-6">
              <nuxt-content
                class="
                  mx-auto
                  prose-sm prose prose-blue
                  sm:prose
                  lg:prose-lg
                  xl:prose-2xl
                "
                :document="page"
              />
            </div>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<script>
export default {
  async asyncData({ params, $content }) {
    const page = (
      await $content('articles').where({ slug: params.id }).fetch()
    )[0]
    return {
      page,
    }
  },
  head() {
    return {
      title: this.page.title,
      meta: [
        { hid: 'author', name: 'author', content: this.page.author },
        {
          hid: 'apple-mobile-web-app-title',
          name: 'apple-mobile-web-app-title',
          content: this.page.title,
        },
        { hid: 'theme-color', name: 'theme-color', content: '#4b279b' },
        {
          hid: 'publisher',
          name: 'publisher',
          content: `${this.$config.DOMAIN}${this.$route.fullPath}`,
        },
        {
          hid: 'og:url',
          property: 'og:url',
          content: `${this.$config.DOMAIN}${this.$route.fullPath}`,
        },
        {
          hid: 'description',
          name: 'description',
          content: this.page.description,
        },
        {
          hid: 'twitter:site',
          name: 'twitter:site',
          content: `${this.$config.DOMAIN}${this.$route.fullPath}`,
        },
        {
          hid: 'twitter:creator',
          name: 'twitter:creator',
          content: this.page.author,
        },
        {
          hid: 'twitter:card',
          name: 'twitter:card',
          content: 'summary_large_image',
        },
        {
          hid: 'twitter:image',
          name: 'twitter:image',
          content: `${this.$config.DOMAIN}${this.page.headImage}`,
        },
        {
          hid: 'twitter:title',
          name: 'twitter:title',
          content: this.page.title,
        },
        {
          hid: 'twitter:description',
          name: 'twitter:description',
          content: this.page.description,
        },
        { hid: 'title', name: 'title', content: this.page.title },
        { hid: 'og:title', property: 'og:title', content: this.page.title },
        {
          hid: 'og:description',
          property: 'og:description',
          content: this.page.description,
        },
        { name: 'og:article:author', content: this.page.author },
        {
          hid: 'og:image:alt',
          property: 'og:image:alt',
          content: this.page.title,
        },
        {
          hid: 'og:image:type',
          property: 'og:image:type',
          content: 'image/jpg',
        },
        {
          hid: 'og:image',
          property: 'og:image',
          content: `${this.$config.DOMAIN}${this.page.headImage}`,
        },
        { hid: 'og:image:width', property: 'og:image:width', content: 300 },
        { hid: 'og:image:height', property: 'og:image:height', content: 300 },
      ],
    }
  },
}
</script>
