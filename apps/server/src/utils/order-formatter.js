function formatItem(item, index) {
  const details = [];
  if (item.size) {
    details.push(`Size: ${item.size}`);
  }
  if (item.color) {
    details.push(`Colour: ${item.color}`);
  }
  if (item.notes) {
    details.push(`Notes: ${item.notes}`);
  }
  if (item.price !== undefined && item.price !== null) {
    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'AZN'
    }).format(item.price);
    details.push(`Price: ${formattedPrice}`);
  }

  const lines = [`${index + 1}. ${item.url}`];
  if (details.length) {
    lines.push(`   ${details.join(' | ')}`);
  }
  return lines.join('\n');
}

function formatDelivery(delivery = {}) {
  const lines = [
    `Recipient: ${delivery.recipientName ?? 'Unknown'}`,
    `Method: ${delivery.method ?? 'Unknown'}`
  ];

  if (delivery.companyName) {
    lines.push(`Company: ${delivery.companyName}`);
  }
  if (delivery.pickupPointName) {
    lines.push(`Pickup point: ${delivery.pickupPointName}`);
  }
  if (delivery.addressLine) {
    lines.push(`Address: ${delivery.addressLine}`);
  }
  if (delivery.customerCode) {
    lines.push(`Customer code: ${delivery.customerCode}`);
  }

  return lines.join('\n');
}

export function formatOrderMessage(submission) {
  const total = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'AZN'
  }).format(submission.total ?? 0);

  const lines = [
    '📦 <b>New order submitted</b>',
    `Order ID: ${submission.id}`,
    `Total: ${total}`,
    '',
    '<b>Items</b>'
  ];

  submission.draft?.items?.forEach((item, index) => {
    lines.push(formatItem(item, index));
  });

  lines.push('', '<b>Delivery</b>', formatDelivery(submission.delivery));

  return lines.join('\n');
}
