const NAVIGATION = [
    {
        label: "WOMEN",
        department: "women",
        link: "/products?department=women",

        columns: [
            {
                groups: [
                    {
                        title: "Indian & Fusion Wear",
                        items: [
                            {
                                label: "Kurtas & Kurtis",
                                slug: "kurtas-kurtis"
                            },
                            {
                                label: "Kurta Sets",
                                search: "Kurta Set"
                            },
                            {
                                label: "Sarees",
                                search: "Saree"
                            },
                            {
                                label: "Ethnic Dresses",
                                search: "Ethnic Dress"
                            },
                            {
                                label: "Lehenga Cholis",
                                search: "Lehenga"
                            },
                            {
                                label: "Dupattas & Shawls",
                                search: "Dupatta"
                            },
                            {
                                label: "Jackets",
                                search: "Jacket"
                            }
                        ]
                    },

                    {
                        title: "Belts, Scarves & More",
                        items: [
                            {
                                label: "Belts",
                                search: "Belt"
                            },
                            {
                                label: "Scarves",
                                search: "Scarf"
                            }
                        ]
                    },

                    {
                        title: "Watches & Wearables",
                        items: [
                            {
                                label: "Watches",
                                search: "Watch"
                            }
                        ]
                    }
                ]
            },

            {
                groups: [
                    {
                        title: "Western Wear",
                        items: [
                            {
                                label: "Dresses",
                                slug: "dresses"
                            },
                            {
                                label: "Tops",
                                search: "Top"
                            },
                            {
                                label: "T-Shirts",
                                search: "T-Shirt"
                            },
                            {
                                label: "Jeans",
                                slug: "jeans"
                            },
                            {
                                label: "Trousers",
                                search: "Trouser"
                            },
                            {
                                label: "Shorts & Skirts",
                                search: "Skirt"
                            },
                            {
                                label: "Co-ords",
                                search: "Co-ord"
                            },
                            {
                                label: "Jumpsuits",
                                search: "Jumpsuit"
                            },
                            {
                                label: "Shrugs",
                                search: "Shrug"
                            },
                            {
                                label: "Sweaters & Sweatshirts",
                                search: "Sweater"
                            },
                            {
                                label: "Jackets & Coats",
                                search: "Jacket"
                            }
                        ]
                    },

                    {
                        title: "Plus Size",
                        items: [
                            {
                                label: "Explore Plus Size",
                                departmentOnly: true
                            }
                        ]
                    }
                ]
            },

            {
                groups: [
                    {
                        title: "Maternity",
                        items: [
                            {
                                label: "Maternity Wear",
                                search: "Maternity"
                            }
                        ]
                    },

                    {
                        title: "Sunglasses & Frames",
                        items: [
                            {
                                label: "Sunglasses",
                                search: "Sunglasses"
                            },
                            {
                                label: "Frames",
                                search: "Frames"
                            }
                        ]
                    },

                    {
                        title: "Footwear",
                        items: [
                            {
                                label: "Flats",
                                search: "Flats"
                            },
                            {
                                label: "Casual Shoes",
                                search: "Casual Shoes"
                            },
                            {
                                label: "Heels",
                                search: "Heels"
                            },
                            {
                                label: "Boots",
                                search: "Boots"
                            },
                            {
                                label: "Sneakers",
                                slug: "footwear"
                            }
                        ]
                    },

                    {
                        title: "Sports & Active Wear",
                        items: [
                            {
                                label: "Clothing",
                                search: "Sports Clothing"
                            },
                            {
                                label: "Footwear",
                                slug: "footwear"
                            },
                            {
                                label: "Sports Accessories",
                                search: "Sports Accessories"
                            }
                        ]
                    }
                ]
            },

            {
                groups: [
                    {
                        title: "Lingerie & Sleepwear",
                        items: [
                            {
                                label: "Bras",
                                search: "Bra"
                            },
                            {
                                label: "Briefs",
                                search: "Brief"
                            },
                            {
                                label: "Shapewear",
                                search: "Shapewear"
                            },
                            {
                                label: "Sleepwear & Loungewear",
                                search: "Sleepwear"
                            },
                            {
                                label: "Swimwear",
                                search: "Swimwear"
                            }
                        ]
                    },

                    {
                        title: "Beauty & Personal Care",
                        items: [
                            {
                                label: "Makeup",
                                to: "/products?department=beauty&category_slug=makeup"
                            },
                            {
                                label: "Skincare",
                                to: "/products?department=beauty&category_slug=skincare"
                            },
                            {
                                label: "Lipsticks",
                                to: "/products?department=beauty&category_slug=makeup"
                            },
                            {
                                label: "Fragrances",
                                to: "/products?department=beauty&category_slug=fragrances"
                            }
                        ]
                    }
                ]
            },

            {
                groups: [
                    {
                        title: "Accessories",
                        items: [
                            {
                                label: "Handbags",
                                search: "Handbag"
                            },
                            {
                                label: "Backpacks",
                                search: "Backpack"
                            },
                            {
                                label: "Wallets",
                                search: "Wallet"
                            },
                            {
                                label: "Sunglasses",
                                search: "Sunglasses"
                            }
                        ]
                    },

                    {
                        title: "Jewellery",
                        items: [
                            {
                                label: "Fashion Jewellery",
                                to: "/products?department=jewellery"
                            },
                            {
                                label: "Earrings",
                                to: "/products?department=jewellery&category_slug=earrings"
                            },
                            {
                                label: "Neck Jewellery",
                                to: "/products?department=jewellery&category_slug=neck-jewellery"
                            },
                            {
                                label: "Rings",
                                to: "/products?department=jewellery&category_slug=rings"
                            }
                        ]
                    },

                    {
                        title: "Trending",
                        items: [
                            {
                                label: "New Arrivals",
                                to: "/products?department=women&sort=newest"
                            },
                            {
                                label: "Top Rated",
                                to: "/products?department=women&sort=rating"
                            },
                            {
                                label: "Best Discounts",
                                to: "/products?department=women&sort=discount"
                            }
                        ]
                    }
                ]
            }
        ]
    },

    {
        label: "KIDS",
        department: "kids",
        link: "/products?department=kids",

        columns: [
            {
                groups: [
                    {
                        title: "Boys Clothing",
                        items: [
                            {
                                label: "Boys Clothing",
                                slug: "boys-clothing"
                            },
                            {
                                label: "T-Shirts",
                                search: "Kids T-Shirt"
                            },
                            {
                                label: "Shirts",
                                search: "Kids Shirt"
                            },
                            {
                                label: "Jeans",
                                search: "Kids Jeans"
                            },
                            {
                                label: "Shorts",
                                search: "Kids Shorts"
                            }
                        ]
                    }
                ]
            },

            {
                groups: [
                    {
                        title: "Girls Clothing",
                        items: [
                            {
                                label: "Girls Clothing",
                                slug: "girls-clothing"
                            },
                            {
                                label: "Dresses",
                                search: "Girls Dress"
                            },
                            {
                                label: "Tops",
                                search: "Girls Top"
                            },
                            {
                                label: "Skirts",
                                search: "Girls Skirt"
                            }
                        ]
                    }
                ]
            },

            {
                groups: [
                    {
                        title: "Baby",
                        items: [
                            {
                                label: "Baby",
                                slug: "baby"
                            },
                            {
                                label: "Rompers",
                                search: "Romper"
                            },
                            {
                                label: "Baby Sets",
                                search: "Baby Set"
                            }
                        ]
                    },

                    {
                        title: "Kids Footwear",
                        items: [
                            {
                                label: "Kids Footwear",
                                slug: "kids-footwear"
                            },
                            {
                                label: "Sneakers",
                                search: "Kids Sneakers"
                            }
                        ]
                    }
                ]
            },

            {
                groups: [
                    {
                        title: "Toys & Games",
                        items: [
                            {
                                label: "Learning Toys",
                                search: "Learning Toy"
                            },
                            {
                                label: "Soft Toys",
                                search: "Soft Toy"
                            },
                            {
                                label: "Building Blocks",
                                search: "Blocks"
                            }
                        ]
                    },

                    {
                        title: "School Essentials",
                        items: [
                            {
                                label: "School Bags",
                                search: "School Bag"
                            },
                            {
                                label: "Stationery",
                                search: "Stationery"
                            }
                        ]
                    }
                ]
            },

            {
                groups: [
                    {
                        title: "Kids Accessories",
                        items: [
                            {
                                label: "Watches",
                                search: "Kids Watch"
                            },
                            {
                                label: "Sunglasses",
                                search: "Kids Sunglasses"
                            },
                            {
                                label: "Hair Accessories",
                                search: "Hair Accessories"
                            }
                        ]
                    },

                    {
                        title: "Trending",
                        items: [
                            {
                                label: "New Arrivals",
                                to: "/products?department=kids&sort=newest"
                            },
                            {
                                label: "Top Rated",
                                to: "/products?department=kids&sort=rating"
                            }
                        ]
                    }
                ]
            }
        ]
    },

    {
        label: "BEAUTY",
        department: "beauty",
        link: "/products?department=beauty",

        columns: [
            {
                groups: [
                    {
                        title: "Makeup",
                        items: [
                            {
                                label: "Makeup",
                                slug: "makeup"
                            },
                            {
                                label: "Lipstick",
                                slug: "makeup"
                            },
                            {
                                label: "Foundation",
                                search: "Foundation"
                            },
                            {
                                label: "Mascara",
                                search: "Mascara"
                            }
                        ]
                    }
                ]
            },

            {
                groups: [
                    {
                        title: "Skincare",
                        items: [
                            {
                                label: "Skincare",
                                slug: "skincare"
                            },
                            {
                                label: "Serums",
                                slug: "skincare"
                            },
                            {
                                label: "Face Creams",
                                slug: "skincare"
                            },
                            {
                                label: "Cleansers",
                                search: "Cleanser"
                            }
                        ]
                    }
                ]
            },

            {
                groups: [
                    {
                        title: "Haircare",
                        items: [
                            {
                                label: "Shampoo",
                                search: "Shampoo"
                            },
                            {
                                label: "Conditioner",
                                search: "Conditioner"
                            },
                            {
                                label: "Hair Serum",
                                search: "Hair Serum"
                            }
                        ]
                    },

                    {
                        title: "Bath & Body",
                        items: [
                            {
                                label: "Body Wash",
                                search: "Body Wash"
                            },
                            {
                                label: "Body Lotion",
                                search: "Body Lotion"
                            }
                        ]
                    }
                ]
            },

            {
                groups: [
                    {
                        title: "Fragrances",
                        items: [
                            {
                                label: "Fragrances",
                                slug: "fragrances"
                            },
                            {
                                label: "Perfume",
                                slug: "fragrances"
                            },
                            {
                                label: "Eau De Parfum",
                                slug: "fragrances"
                            }
                        ]
                    }
                ]
            },

            {
                groups: [
                    {
                        title: "Trending",
                        items: [
                            {
                                label: "New Arrivals",
                                to: "/products?department=beauty&sort=newest"
                            },
                            {
                                label: "Top Rated",
                                to: "/products?department=beauty&sort=rating"
                            },
                            {
                                label: "Best Discounts",
                                to: "/products?department=beauty&sort=discount"
                            }
                        ]
                    }
                ]
            }
        ]
    },

    {
        label: "JEWELLERY",
        department: "jewellery",
        link: "/products?department=jewellery",

        columns: [
            {
                groups: [
                    {
                        title: "Earrings",
                        items: [
                            {
                                label: "Earrings",
                                slug: "earrings"
                            },
                            {
                                label: "Hoops",
                                slug: "earrings"
                            },
                            {
                                label: "Jhumkas",
                                search: "Jhumka"
                            }
                        ]
                    }
                ]
            },

            {
                groups: [
                    {
                        title: "Neck Jewellery",
                        items: [
                            {
                                label: "Neck Jewellery",
                                slug: "neck-jewellery"
                            },
                            {
                                label: "Necklaces",
                                slug: "neck-jewellery"
                            },
                            {
                                label: "Pendants",
                                search: "Pendant"
                            }
                        ]
                    }
                ]
            },

            {
                groups: [
                    {
                        title: "Rings",
                        items: [
                            {
                                label: "Rings",
                                slug: "rings"
                            },
                            {
                                label: "Statement Rings",
                                slug: "rings"
                            }
                        ]
                    },

                    {
                        title: "Hands & Arms",
                        items: [
                            {
                                label: "Bracelets",
                                search: "Bracelet"
                            },
                            {
                                label: "Bangles",
                                search: "Bangle"
                            }
                        ]
                    }
                ]
            },

            {
                groups: [
                    {
                        title: "Traditional Jewellery",
                        items: [
                            {
                                label: "Traditional Jewellery",
                                slug: "traditional-jewellery"
                            },
                            {
                                label: "Kundan",
                                slug: "traditional-jewellery"
                            },
                            {
                                label: "Wedding Jewellery",
                                slug: "traditional-jewellery"
                            }
                        ]
                    }
                ]
            },

            {
                groups: [
                    {
                        title: "Shop By Edit",
                        items: [
                            {
                                label: "New Arrivals",
                                to: "/products?department=jewellery&sort=newest"
                            },
                            {
                                label: "Top Rated",
                                to: "/products?department=jewellery&sort=rating"
                            },
                            {
                                label: "Best Discounts",
                                to: "/products?department=jewellery&sort=discount"
                            }
                        ]
                    }
                ]
            }
        ]
    }
];


export default NAVIGATION;