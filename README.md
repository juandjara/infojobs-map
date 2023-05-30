# Infojobs Map

This project was built using the [**remix-tailwind-starter**](https://github.com/juandjara/remix-tailwind-starter) project template.

This is a small PoC for a geographical-based search of job offers in InfoJobs. It only uses the `/offer` public endpoint of the InfoJobs API, building the map layers combining local geojson sources and the counts and keys from the `facets` returned in that endpoint. The data shown in the map always corresponds to the `city` and `province` facet data returned every time filters are changed. When two or more points are close together, clustering is applied on the client side. 

Tech stack used:
- Remix
- Tailwind
- Typescript
- Headless UI
- HeroIcons
- Deck.gl
- MaplibreGL
- CARTO Basemaps

## Local development

You will need to copy the `.env.example` to a `.env` file in the same folder and write your infojobs API key there

From your terminal:

```sh
npm run dev
```

This starts your app in development mode, rebuilding assets on file changes.

## Setup for deploying on Fly

1. [Install `flyctl`](https://fly.io/docs/getting-started/installing-flyctl/)

2. Sign up and log in to Fly

```sh
flyctl auth signup
```

3. Setup Fly. It might ask if you want to deploy, say no since you haven't built the app yet.

```sh
flyctl launch
```

## Deployment

If you've followed the setup instructions already, all you need to do is run this:

```sh
npm run deploy
```

You can run `flyctl info` to get the url and ip address of your server.

Check out the [fly docs](https://fly.io/docs/getting-started/node/) for more information.
