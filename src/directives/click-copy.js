import CF from '@/common/common-functions';

export default {
  inserted(el, binding) {
    if (binding.value) {
      el.addEventListener('click', () => {
        if (typeof binding.value === 'function') {
          CF.copyToClipboard(binding.value());
        } else {
          CF.copyToClipboard(binding.value);
        }
      });
    }
  },
};
