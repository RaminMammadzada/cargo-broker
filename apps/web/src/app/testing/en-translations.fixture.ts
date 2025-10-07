export const enTranslations = {
  app: {
    brand: 'Cargo Broker MVP'
  },
  language: {
    label: 'Language',
    az: 'Azerbaijani',
    en: 'English',
    ru: 'Russian'
  },
  nav: {
    order: 'Order',
    delivery: 'Delivery',
    review: 'Review',
    payment: 'Payment',
    status: 'Status',
    checkoutProgress: 'Checkout progress',
    stepStatus: {
      complete: 'Completed',
      current: 'Current step',
      upcoming: 'Upcoming step'
    }
  },
  landing: {
    badge: 'Welcome',
    title: 'Cargo order assistant MVP',
    description:
      'Start by choosing your preferred language and then add up to three product links that you would like us to purchase on your behalf.',
    actions: {
      start: 'Begin order flow',
      review: 'See review step'
    }
  },
  layout: {
    skipToContent: 'Skip to main content',
    homeLink: 'Go to home',
    footer: {
      copyright: '© {{year}} Cargo Broker MVP. All rights reserved.',
      note: 'Initial prototype scaffolding.',
      adminLink: 'Admin settings'
    }
  },
  toast: {
    none: 'No notifications yet',
    close: 'Close notification',
    regionLabel: 'Notifications'
  },
  pages: {
    order: {
      title: 'Order links',
      description:
        'Add up to three products that you would like us to purchase. Each link can include optional size, colour, price, and notes so our agents understand the request.'
    },
    delivery: {
      title: 'Delivery details',
      description:
        'Choose courier or pickup fulfilment, provide the recipient information, and share the company-specific customer code so we can route the parcel correctly.',
      helper: 'Delivery preferences are saved after you continue to the review step.'
    },
    review: {
      title: 'Review & confirm',
      description:
        'Review your product links and delivery preferences one more time before moving to payment.',
      placeholder: 'Summary cards and confirmation actions will be rendered here once the state layer is ready.'
    },
    payment: {
      title: 'Mock payment',
      description: 'Review your order total and run a simulated payment to move to the status page.'
    },
    status: {
      title: 'Order status',
      description: 'See the result of your simulated payment and next steps for the mock order.',
      actions: {
        backToPayment: 'Back to payment',
        viewOrders: 'View orders',
        startNew: 'Start a new order'
      }
    },
    orders: {
      title: 'Order inbox',
      description:
        'Review previously submitted mock orders and jump back into their status pages for more testing.',
      actions: {
        viewStatus: 'View status'
      },
      empty: {
        title: 'No orders yet',
        description:
          'Submit a mock order to populate the inbox. Your submissions will stay here for future reference while you remain in this browser.',
        action: 'Start a new order'
      }
    }
  },
  review: {
    summary: {
      order: {
        title: 'Order summary',
        description: 'Confirm each product link and its details before continuing.',
        actions: {
          edit: 'Edit order'
        },
        itemLabel: 'Item {{index}}',
        fields: {
          url: 'Product link',
          size: 'Size',
          color: 'Colour',
          notes: 'Notes'
        }
      },
      delivery: {
        title: 'Delivery summary',
        description: 'Make sure the fulfilment method and recipient information are correct.',
        actions: {
          edit: 'Edit delivery'
        },
        fields: {
          recipient: 'Recipient',
          method: {
            label: 'Delivery method',
            options: {
              courier: 'Courier delivery',
              pickup: 'Pickup from partner desk'
            }
          },
          company: 'Logistics company',
          pickupPoint: 'Pickup point',
          address: 'Courier address',
          customerCode: 'Customer code'
        }
      },
      totals: {
        title: 'Ready to confirm?',
        description: 'Submitting will create a mock order and move you to payment.',
        itemsLabel: 'Items ({{count}})',
        deliveryLabel: 'Delivery',
        actions: {
          confirm: 'Confirm & continue'
        }
      },
      notifications: {
        success: 'Order details sent to Telegram.',
        error: "We couldn't send the order to Telegram. Please try again."
      }
    }
  },
  payment: {
    summary: {
      title: 'Ready to complete payment?',
      description: 'We will run a simulated transaction using the total below.',
      total: 'Total due',
      helper: 'This is a mock charge used to drive the prototype flow.'
    },
    simulation: {
      title: 'Simulation outcome',
      description: 'Choose the payment result to test success and failure messaging.',
      approved: 'Simulate success',
      failed: 'Simulate failure'
    },
    actions: {
      pay: 'Pay now'
    },
    details: {
      title: 'Order details',
      orderId: 'Order reference',
      items: 'Items',
      recipient: 'Recipient',
      method: 'Delivery method'
    },
    missing: {
      title: "We couldn't find your order",
      description: 'Return to the review step and confirm again so we can create a new submission.'
    },
    status: {
      idle: '',
      initiated: 'Processing payment…',
      approved: 'Payment approved',
      failed: 'Payment failed'
    }
  },
  status: {
    reference: 'Order #{{id}}',
    states: {
      initiated: 'Payment in progress',
      approved: 'Payment approved',
      failed: 'Payment failed'
    },
    helper: 'We saved your mock order in the local inbox for future reference.',
    summary: {
      total: 'Total amount',
      recipient: 'Recipient'
    },
    nextSteps: 'You can start a new order or rerun the payment simulation.',
    missing: {
      title: 'Order not available',
      description: "We couldn't match this status to a stored order. Submit a new mock order to continue testing."
    }
  },
  orders: {
    reference: 'Order #{{id}}',
    createdAt: 'Created on {{date}}',
    total: 'Total',
    recipient: 'Recipient'
  },
  admin: {
    telegram: {
      badge: 'Admin',
      title: 'Telegram notifications',
      description:
        'Enter the phone number linked to the Telegram account that should receive order submissions. Make sure the account has started a chat with your bot and shared their contact details.',
      lastUpdated: 'Last synced {{timestamp}}',
      form: {
        phoneNumber: {
          label: 'Phone number',
          hint: 'Use the full number. We will automatically match it to the chat once the bot sees the contact.',
          placeholder: '+994 55 123 45 67'
        },
        actions: {
          save: 'Save settings'
        },
        errors: {
          required: 'Phone number is required.',
          pattern: 'Use digits, spaces, brackets or plus sign only.',
          generic: 'Update failed. Try again.'
        },
        missingBotToken:
          'The Telegram bot token is missing. Update the configuration file or environment variable and reload this page.',
        currentChat: 'Current chat ID: {{chat}}'
      },
      notifications: {
        saved: 'Telegram recipient updated.',
        saveError: 'Unable to update Telegram recipient. Try again.',
        loadError: 'Unable to load Telegram settings.'
      }
    }
  },
  order: {
    form: {
      add: 'Add another link',
      remove: 'Remove',
      itemLabel: 'Item {{index}}',
      itemHelper: 'Provide the product link and any helpful context.',
      removeItem: 'Remove item {{index}}',
      actions: {
        next: 'Continue to delivery'
      },
      fields: {
        url: {
          label: 'Product link',
          placeholder: 'https://example.com/product'
        },
        size: {
          label: 'Size',
          hint: 'Optional'
        },
        color: {
          label: 'Colour',
          hint: 'Optional'
        },
        price: {
          label: 'Estimated price (AZN)',
          hint: 'Optional — used for totals'
        },
        notes: {
          label: 'Notes',
          hint: 'Add any extra guidance for our shoppers'
        }
      },
      errors: {
        required: 'This field is required.',
        url: 'Enter a valid URL starting with http or https.',
        priceMin: 'Price must be zero or greater.',
        duplicate: 'Each link must be unique.'
      }
    }
  },
  delivery: {
    form: {
      title: 'Where should we send your order?',
      subtitle: 'We use these details to pass your package to the right partner.',
      actions: {
        back: 'Back to order',
        next: 'Continue to review'
      },
      fields: {
        recipientName: {
          label: 'Recipient name'
        },
        customerCode: {
          label: 'Customer code'
        },
        method: {
          label: 'Delivery method',
          options: {
            courier: 'Courier delivery',
            pickup: 'Pickup from partner desk'
          }
        },
        company: {
          label: 'Logistics company',
          placeholder: 'Select a company'
        },
        pickupPoint: {
          label: 'Pickup point',
          placeholder: 'Select a pickup point'
        },
        address: {
          label: 'Courier address'
        }
      },
      errors: {
        required: 'This field is required.'
      }
    }
  }
} as const;
