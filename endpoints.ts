import { createApi, createApiEndpoint } from "@danstackme/apity";
import { z } from "zod";

type ProductVariant = {
  id: string;
  name: string;
  price: number;
};

type Product = {
  id: string;
  name: string;
  description: string;
  order: number;
  subscription: boolean;
  variants: ProductVariant[];
  tags: {
    app: string;
    color: string;
    featured: string;
    market_na: boolean;
    market_eu: boolean;
  };
};

const GET_product = createApiEndpoint({
  method: "GET",
  response: z.object({
    data: z.array(z.custom<Product>()),
  }),
});

const GET_product_id = createApiEndpoint({
  method: "GET",
  response: z.object({
    data: z.unknown(),
  }),
});

const GET_profile = createApiEndpoint({
  method: "GET",
  response: z.object({
    data: z.unknown(),
  }),
});

const GET_address = createApiEndpoint({
  method: "GET",
  response: z.object({
    data: z.array(z.unknown()),
  }),
});

const GET_address_id = createApiEndpoint({
  method: "GET",
  response: z.object({
    data: z.unknown(),
  }),
});

const GET_card = createApiEndpoint({
  method: "GET",
  response: z.object({
    data: z.array(z.unknown()),
  }),
});

const GET_card_id = createApiEndpoint({
  method: "GET",
  response: z.object({
    data: z.unknown(),
  }),
});

const GET_cart = createApiEndpoint({
  method: "GET",
  response: z.object({
    data: z.unknown(),
  }),
});

const GET_order = createApiEndpoint({
  method: "GET",
  response: z.object({
    data: z.array(z.unknown()),
  }),
});

const GET_order_id = createApiEndpoint({
  method: "GET",
  response: z.object({
    data: z.unknown(),
  }),
});

const GET_subscription = createApiEndpoint({
  method: "GET",
  response: z.object({
    data: z.array(z.unknown()),
  }),
});

const GET_subscription_id = createApiEndpoint({
  method: "GET",
  response: z.object({
    data: z.unknown(),
  }),
});

const GET_token = createApiEndpoint({
  method: "GET",
  response: z.object({
    data: z.array(z.unknown()),
  }),
});

const GET_token_id = createApiEndpoint({
  method: "GET",
  response: z.object({
    data: z.unknown(),
  }),
});

const GET_app = createApiEndpoint({
  method: "GET",
  response: z.object({
    data: z.array(z.unknown()),
  }),
});

const GET_app_id = createApiEndpoint({
  method: "GET",
  response: z.object({
    data: z.unknown(),
  }),
});

const GET_viewinit = createApiEndpoint({
  method: "GET",
  response: z.object({
    data: z.object({
      profile: z.unknown(),
      products: z.array(z.unknown()),
      cart: z.unknown(),
      addresses: z.array(z.unknown()),
      cards: z.array(z.unknown()),
      subscriptions: z.array(z.unknown()),
      orders: z.array(z.unknown()),
      tokens: z.array(z.unknown()),
      apps: z.array(z.unknown()),
      region: z.unknown(),
    }),
  }),
});

const PUT_profile = createApiEndpoint({
  method: "PUT",
  response: z.object({
    data: z.unknown(),
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
    country: z.string(),
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
    data: z.unknown(),
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
    data: z.unknown(),
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
  body: z.unknown(),
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
