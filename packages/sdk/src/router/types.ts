import * as Sdk from "../index";

export type GenericOrder =
  | {
      kind: "foundation";
      order: Sdk.Foundation.Order;
    }
  | {
      kind: "looks-rare";
      order: Sdk.LooksRare.Order;
    }
  | {
      kind: "x2y2";
      order: Sdk.X2Y2.Order;
    }
  | {
      kind: "zeroex-v4";
      order: Sdk.ZeroExV4.Order;
    }
  | {
      kind: "seaport";
      order: Sdk.Seaport.Order;
    }
  | {
      kind: "cryptopunks";
      order: Sdk.CryptoPunks.Order;
    }
  | {
      kind: "sudoswap";
      order: Sdk.Sudoswap.Order;
    }
  | {
      kind: "zora";
      order: Sdk.Zora.Order;
    }
  | {
      kind: "universe";
      order: Sdk.Universe.Order;
    }
  | {
      kind: "element";
      order: Sdk.Element.Order;
    };

export type ListingFillDetails = {
  contractKind: "erc721" | "erc1155";
  contract: string;
  tokenId: string;
  currency: string;
  // Relevant for partially-fillable orders
  amount?: number | string;
};

export type BidFillDetails = {
  contractKind: "erc721" | "erc1155";
  contract: string;
  tokenId: string;
  // Relevant for partially-fillable orders
  amount?: number | string;
  // Relevant for merkle orders
  extraArgs?: any;
};

export type ListingDetails = GenericOrder & ListingFillDetails;
export type BidDetails = GenericOrder & BidFillDetails;
