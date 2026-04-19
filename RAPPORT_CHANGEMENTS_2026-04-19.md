# Rapport Des Changements - 2026-04-19

## Contexte
Ce rapport résume les corrections réalisées pour:
- accès direct aux routes store (`/vendor/:slug` et `/:slug`),
- erreurs API d'authentification/signature,
- erreur frontend `FIRST_SLIDE_IMAGE_URL`,
- erreurs répétées `410 Gone` sur `filter-all-store-product` avec boucle de requêtes.

## Changements Code (déjà poussés)
Commit déjà poussé: `d40500a`

### 1) Restauration de la couche sécurité API
- Ajout de `src/security.service.ts` (signature des requêtes + chiffrement/déchiffrement en prod).
- Réintégration des clés/config manquantes dans:
  - `src/environments/environment.ts`
  - `src/environments/environment.prod.ts`
- Champs restaurés: `secureUrl`, `ENC_KEY`, `IV`, `baseUrl`.

### 2) Réactivation des appels signés dans les services
Les services suivants utilisent de nouveau `SecurityService.signedRequest(...)`:
- `src/app/shared/services/user.service.ts`
- `src/app/shared/services/store.service.ts`
- `src/app/shared/services/order.service.ts`
- `src/app/shared/services/nav.service.ts`
- `src/app/shared/services/homeslider.service.ts`
- `src/app/shared/services/product.service.ts`

### 3) Compatibilité fonctionnelle
- Restauration de `getHomeFilteredProduct(...)` dans `product.service.ts` pour conserver la compatibilité avec `single-store-banner`.

### 4) Correction preload invalide
- Suppression du preload statique invalide `FIRST_SLIDE_IMAGE_URL` dans `src/index.html`.

## Changements Infra (CloudFront)
Actions appliquées directement sur la distribution:
- Ajout fallback SPA:
  - `403 -> /index.html` (HTTP `200`, TTL `0`)
  - `404 -> /index.html` (HTTP `200`, TTL `0`)
- Invalidation globale déclenchée et complétée.

But:
- éviter les pages XML `AccessDenied` sur accès direct aux URLs profondes.

## Changements Code (nouveaux - ce cycle)
Fichiers modifiés:
- `src/app/shared/services/product.service.ts`
- `src/app/shop/all-2d-3d-products/all-2d-3d-products.component.ts`

### 1) Correction `410 Gone` sur `filter-all-store-product`
Cause identifiée:
- l'API attend maintenant `tag_ids` (array) et échoue si `tag_id` est envoyé ou si `tag_ids` est absent.

Correctif:
- Ajout d'une normalisation de payload dans `get2D3DFilteredProduct(...)`:
  - conversion `tag_id -> tag_ids`,
  - `tag_ids` forcé à `[]` si absent,
  - `product_category` forcé en string,
  - valeurs par défaut pour `brand`, `page`, `limit`.

### 2) Stop boucle de requêtes en erreur
Dans `all-2d-3d-products.component.ts`, sur erreur `400/404/410`:
- `hasMoreProducts = false` pour bloquer le retry infini déclenché par le scroll.

## Validation Technique
- Vérification TypeScript:
  - `npx tsc -p tsconfig.app.json --noEmit` -> OK.
- Test API signé (hors UI) effectué:
  - `filter-all-store-product` renvoie `200` quand le payload contient `tag_ids: []`.
  - `filter-all-store-product` renvoie `410` quand `tag_ids` est absent ou `tag_id` seul.

## Résultat Attendu
- Les produits doivent réapparaître sur les pages 2D/3D.
- La boucle d'erreurs réseau `410` ne doit plus saturer la console.
- Les deep links store ne doivent plus afficher de XML `AccessDenied`.
