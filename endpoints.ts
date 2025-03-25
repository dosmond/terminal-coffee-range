import { createApi, createApiEndpoint } from "@danstackme/apity";
import { z } from "zod";

// Schema definitions
export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  variants: z.array(z.lazy(() => ProductVariantSchema)),
  order: z.number().optional(),
  subscription: z.enum(["allowed", "required"]).optional(),
  tags: z
    .object({
      app: z.string().optional(),
      color: z.string().optional(),
      featured: z.boolean().optional(),
      market_na: z.boolean().optional(),
      market_eu: z.boolean().optional(),
    })
    .optional(),
});

export const ProductVariantSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().min(0),
});

export const ErrorResponseSchema = z.object({
  type: z.enum([
    "validation",
    "authentication",
    "forbidden",
    "not_found",
    "rate_limit",
    "internal",
  ]),
  code: z.string(),
  message: z.string(),
  param: z.string().optional(),
  details: z.unknown().optional(),
});

export const ProfileSchema = z.object({
  user: z.lazy(() => UserSchema),
});

export const UserSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.string().nullable(),
  fingerprint: z.string().nullable(),
  stripeCustomerID: z.string(),
});

export const AddressSchema = z.object({
  id: z.string(),
  name: z.string(),
  street1: z.string(),
  street2: z.string().optional(),
  city: z.string(),
  province: z.string().optional(),
  country: z.string().min(2).max(2),
  zip: z.string(),
  phone: z.string().optional(),
});

export const CardSchema = z.object({
  id: z.string(),
  brand: z.string(),
  expiration: z.object({
    year: z.number(),
    month: z.number(),
  }),
  last4: z.string(),
});

export const CartSchema = z.object({
  items: z.array(z.lazy(() => CartItemSchema)),
  subtotal: z.number().min(0),
  addressID: z.string().optional(),
  cardID: z.string().optional(),
  amount: z.object({
    subtotal: z.number(),
    shipping: z.number().optional(),
    total: z.number().optional(),
  }),
  shipping: z
    .object({
      service: z.string().optional(),
      timeframe: z.string().optional(),
    })
    .optional(),
});

export const CartItemSchema = z.object({
  id: z.string(),
  productVariantID: z.string(),
  quantity: z.number().min(0),
  subtotal: z.number(),
});

export const OrderSchema = z.object({
  id: z.string(),
  index: z.number().optional(),
  shipping: z.object({
    name: z.string(),
    street1: z.string(),
    street2: z.string().optional(),
    city: z.string(),
    province: z.string().optional(),
    country: z.string().min(2).max(2),
    zip: z.string(),
    phone: z.string().optional(),
  }),
  amount: z.object({
    shipping: z.number(),
    subtotal: z.number(),
  }),
  tracking: z.object({
    service: z.string().optional(),
    number: z.string().optional(),
    url: z.string().optional(),
  }),
  items: z.array(z.lazy(() => OrderItemSchema)),
});

export const OrderItemSchema = z.object({
  id: z.string(),
  description: z.string().optional(),
  amount: z.number(),
  quantity: z.number().min(0),
  productVariantID: z.string().optional(),
});

export const SubscriptionSchema = z.object({
  id: z.string(),
  productVariantID: z.string(),
  quantity: z.number(),
  addressID: z.string(),
  cardID: z.string(),
  schedule: z
    .object({
      type: z.string(),
    })
    .or(
      z.object({
        type: z.string(),
        interval: z.number().min(1),
      })
    )
    .optional(),
  next: z.string().optional(),
});

export const TokenSchema = z.object({
  id: z.string(),
  created: z.string(),
  token: z.string(),
});

export const AppSchema = z.object({
  id: z.string(),
  name: z.string(),
  redirectURI: z.string(),
  secret: z.string(),
});

export const RegionSchema = z.enum(["eu", "na"]);

const GET_product = createApiEndpoint({
  method: "GET",
  response: z.object({
    data: z.array(z.lazy(() => ProductSchema)),
  }),
});

const GET_product_id = createApiEndpoint({
  method: "GET",
  response: z.object({
    data: z.lazy(() => ProductSchema),
  }),
});

const GET_profile = createApiEndpoint({
  method: "GET",
  response: z.object({
    data: z.lazy(() => ProfileSchema),
  }),
});

const GET_address = createApiEndpoint({
  method: "GET",
  response: z.object({
    data: z.array(z.lazy(() => AddressSchema)),
  }),
});

const GET_address_id = createApiEndpoint({
  method: "GET",
  response: z.object({
    data: z.lazy(() => AddressSchema),
  }),
});

const GET_card = createApiEndpoint({
  method: "GET",
  response: z.object({
    data: z.array(z.lazy(() => CardSchema)),
  }),
});

const GET_card_id = createApiEndpoint({
  method: "GET",
  response: z.object({
    data: z.lazy(() => CardSchema),
  }),
});

const GET_cart = createApiEndpoint({
  method: "GET",
  response: z.object({
    data: z.lazy(() => CartSchema),
  }),
});

const GET_order = createApiEndpoint({
  method: "GET",
  response: z.object({
    data: z.array(z.lazy(() => OrderSchema)),
  }),
});

const GET_order_id = createApiEndpoint({
  method: "GET",
  response: z.object({
    data: z.lazy(() => OrderSchema),
  }),
});

const GET_subscription = createApiEndpoint({
  method: "GET",
  response: z.object({
    data: z.array(z.lazy(() => SubscriptionSchema)),
  }),
});

const GET_subscription_id = createApiEndpoint({
  method: "GET",
  response: z.object({
    data: z.lazy(() => SubscriptionSchema),
  }),
});

const GET_token = createApiEndpoint({
  method: "GET",
  response: z.object({
    data: z.array(z.lazy(() => TokenSchema)),
  }),
});

const GET_token_id = createApiEndpoint({
  method: "GET",
  response: z.object({
    data: z.lazy(() => TokenSchema),
  }),
});

const GET_app = createApiEndpoint({
  method: "GET",
  response: z.object({
    data: z.array(z.lazy(() => AppSchema)),
  }),
});

const GET_app_id = createApiEndpoint({
  method: "GET",
  response: z.object({
    data: z.lazy(() => AppSchema),
  }),
});

const GET_viewinit = createApiEndpoint({
  method: "GET",
  response: z.object({
    data: z.object({
      profile: z.lazy(() => ProfileSchema),
      products: z.array(z.lazy(() => ProductSchema)),
      cart: z.lazy(() => CartSchema),
      addresses: z.array(z.lazy(() => AddressSchema)),
      cards: z.array(z.lazy(() => CardSchema)),
      subscriptions: z.array(z.lazy(() => SubscriptionSchema)),
      orders: z.array(z.lazy(() => OrderSchema)),
      tokens: z.array(z.lazy(() => TokenSchema)),
      apps: z.array(z.lazy(() => AppSchema)),
      region: z.lazy(() => RegionSchema),
    }),
  }),
});

const PUT_profile = createApiEndpoint({
  method: "PUT",
  response: z.object({
    data: z.lazy(() => ProfileSchema),
  }),
  body: z.object({
    name: z.string(),
    email: z.string().email(),
  }),
});

const POST_address = createApiEndpoint({
  method: "POST",
  response: z.object({
    data: z.string(),
  }),
  body: z.object({
    name: z.string(),
    street1: z.string(),
    street2: z.string().optional(),
    city: z.string(),
    province: z.string().optional(),
    country: z.string().min(2).max(2),
    zip: z.string(),
    phone: z.string().optional(),
  }),
});

const DELETE_address_id = createApiEndpoint({
  method: "DELETE",
  response: z.object({
    data: z.string(),
  }),
});

const POST_card = createApiEndpoint({
  method: "POST",
  response: z.object({
    data: z.string(),
  }),
  body: z.object({
    token: z.string(),
  }),
});

const DELETE_card_id = createApiEndpoint({
  method: "DELETE",
  response: z.object({
    data: z.string(),
  }),
});

const POST_cardcollect = createApiEndpoint({
  method: "POST",
  response: z.object({
    data: z.object({
      url: z.string(),
    }),
  }),
});

const DELETE_cart = createApiEndpoint({
  method: "DELETE",
  response: z.object({
    data: z.string(),
  }),
});

const PUT_cartitem = createApiEndpoint({
  method: "PUT",
  response: z.object({
    data: z.lazy(() => CartSchema),
  }),
  body: z.object({
    productVariantID: z.string(),
    quantity: z.number().min(0),
  }),
});

const PUT_cartaddress = createApiEndpoint({
  method: "PUT",
  response: z.object({
    data: z.string(),
  }),
  body: z.object({
    addressID: z.string(),
  }),
});

const PUT_cartcard = createApiEndpoint({
  method: "PUT",
  response: z.object({
    data: z.string(),
  }),
  body: z.object({
    cardID: z.string(),
  }),
});

const POST_cartconvert = createApiEndpoint({
  method: "POST",
  response: z.object({
    data: z.lazy(() => OrderSchema),
  }),
});

const POST_order = createApiEndpoint({
  method: "POST",
  response: z.object({
    data: z.string(),
  }),
  body: z.object({
    variants: z.object({}),
    cardID: z.string(),
    addressID: z.string(),
  }),
});

const POST_subscription = createApiEndpoint({
  method: "POST",
  response: z.object({
    data: z.string(),
  }),
  body: z.object({
    productVariantID: z.string(),
    quantity: z.number(),
    addressID: z.string(),
    cardID: z.string(),
    schedule: z
      .object({
        type: z.string(),
      })
      .or(
        z.object({
          type: z.string(),
          interval: z.number().min(1),
        })
      )
      .optional(),
    next: z.string().optional(),
  }),
});

const DELETE_subscription_id = createApiEndpoint({
  method: "DELETE",
  response: z.object({
    data: z.string(),
  }),
});

const POST_token = createApiEndpoint({
  method: "POST",
  response: z.object({
    data: z.object({
      id: z.string(),
      token: z.string(),
    }),
  }),
});

const DELETE_token_id = createApiEndpoint({
  method: "DELETE",
  response: z.object({
    data: z.string(),
  }),
});

const POST_app = createApiEndpoint({
  method: "POST",
  response: z.object({
    data: z.object({
      id: z.string(),
      secret: z.string(),
    }),
  }),
  body: z.object({
    name: z.string(),
    redirectURI: z.string(),
  }),
});

const DELETE_app_id = createApiEndpoint({
  method: "DELETE",
  response: z.object({
    data: z.string(),
  }),
});

const POST_email = createApiEndpoint({
  method: "POST",
  response: z.object({
    data: z.string(),
  }),
  body: z.object({
    email: z.string().email(),
  }),
});

export const fetchEndpoints = {
  "/product": [GET_product],
  "/product/[id]": [GET_product_id],
  "/profile": [GET_profile],
  "/address": [GET_address],
  "/address/[id]": [GET_address_id],
  "/card": [GET_card],
  "/card/[id]": [GET_card_id],
  "/cart": [GET_cart],
  "/order": [GET_order],
  "/order/[id]": [GET_order_id],
  "/subscription": [GET_subscription],
  "/subscription/[id]": [GET_subscription_id],
  "/token": [GET_token],
  "/token/[id]": [GET_token_id],
  "/app": [GET_app],
  "/app/[id]": [GET_app_id],
  "/view/init": [GET_viewinit],
} as const;

export const mutateEndpoints = {
  "/profile": [PUT_profile],
  "/address": [POST_address],
  "/address/[id]": [DELETE_address_id],
  "/card": [POST_card],
  "/card/[id]": [DELETE_card_id],
  "/card/collect": [POST_cardcollect],
  "/cart": [DELETE_cart],
  "/cart/item": [PUT_cartitem],
  "/cart/address": [PUT_cartaddress],
  "/cart/card": [PUT_cartcard],
  "/cart/convert": [POST_cartconvert],
  "/order": [POST_order],
  "/subscription": [POST_subscription],
  "/subscription/[id]": [DELETE_subscription_id],
  "/token": [POST_token],
  "/token/[id]": [DELETE_token_id],
  "/app": [POST_app],
  "/app/[id]": [DELETE_app_id],
  "/email": [POST_email],
} as const;

export const api = createApi({
  baseUrl: "https://api.dev.terminal.shop",
  fetchEndpoints,
  mutateEndpoints,
});
