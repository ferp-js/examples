export const make = (patch, targetElement, view) => {
  return ([state, _effect], _actionName) => {
    patch(targetElement, view(state));
  };
};
