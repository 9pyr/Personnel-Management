/**
 * Custom naming convention rule:
 * - React component props types (first param named "props") must end with "Props"
 * - Function params types (first param named "params") must end with "Params"
 * - Type aliases using z.infer must end with "Type"
 */

/** @type {import('eslint').Rule.RuleModule} */
const namingSuffixRule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'บังคับ suffix ของ type ให้ตรงตาม convention: component props → Props, function params → Params, z.infer → Type',
      recommended: false,
    },
    schema: [],
    messages: {
      componentPropsSuffix:
        'Component props type "{{name}}" ต้องลงท้ายด้วย "Props" (เช่น {{name}}Props).',
      functionParamsSuffix:
        'Function params type "{{name}}" ต้องลงท้ายด้วย "Params" (เช่น {{name}}Params).',
      zInferSuffix: 'Type alias "{{name}}" ที่ใช้ z.infer ต้องลงท้ายด้วย "Type".',
    },
  },
  create(context) {
    /**
     * ตรวจชื่อ type ที่มาจาก z.infer
     * @param {import('@typescript-eslint/types/dist/generated/ast-spec').TSTypeAliasDeclaration} node
     */
    function checkZInferTypeAlias(node) {
      const annotation = node.typeAnnotation
      if (!annotation || annotation.type !== 'TSTypeReference') return

      const typeName = annotation.typeName
      if (
        !typeName ||
        typeName.type !== 'TSQualifiedName' ||
        typeName.left.type !== 'Identifier' ||
        typeName.right.type !== 'Identifier'
      ) {
        return
      }

      const isZInfer = typeName.left.name === 'z' && typeName.right.name === 'infer'
      if (!isZInfer) return

      const aliasName = node.id.name
      if (!aliasName.endsWith('Type')) {
        context.report({
          node: node.id,
          messageId: 'zInferSuffix',
          data: { name: aliasName },
        })
      }
    }

    /**
     * คืนชื่อ type identifier ของ param ถ้ามี
     * @param {import('@typescript-eslint/types/dist/generated/ast-spec').Identifier} param
     */
    function getParamTypeName(param) {
      const typeAnn = param.typeAnnotation && param.typeAnnotation.typeAnnotation
      if (!typeAnn || typeAnn.type !== 'TSTypeReference') return null

      const tn = typeAnn.typeName
      if (!tn || tn.type !== 'Identifier') return null

      return { node: tn, name: tn.name }
    }

    /**
     * ตรวจ suffix ของ type ที่ใช้กับ props / params
     * @param {import('@typescript-eslint/types/dist/generated/ast-spec').FunctionDeclaration | import('@typescript-eslint/types/dist/generated/ast-spec').ArrowFunctionExpression} node
     */
    function checkFunctionLike(node) {
      if (!node.params || node.params.length === 0) return

      const firstParam = node.params[0]
      if (firstParam.type !== 'Identifier') return

      const paramName = firstParam.name
      const typeInfo = getParamTypeName(firstParam)
      if (!typeInfo) return

      const { node: typeNode, name: typeName } = typeInfo

      // React component: ชื่อ function ขึ้นต้นด้วยตัวใหญ่ และ param แรกชื่อ props
      if (
        paramName === 'props' &&
        ((node.type === 'FunctionDeclaration' && node.id && /^[A-Z]/.test(node.id.name)) ||
          (node.type === 'ArrowFunctionExpression' &&
            node.parent &&
            node.parent.type === 'VariableDeclarator' &&
            node.parent.id.type === 'Identifier' &&
            /^[A-Z]/.test(node.parent.id.name)))
      ) {
        if (!typeName.endsWith('Props')) {
          context.report({
            node: typeNode,
            messageId: 'componentPropsSuffix',
            data: { name: typeName },
          })
        }
        return
      }

      // ทั่วไป: ถ้า param ชื่อ params ให้บังคับ suffix เป็น Params
      if (paramName === 'params') {
        if (!typeName.endsWith('Params')) {
          context.report({
            node: typeNode,
            messageId: 'functionParamsSuffix',
            data: { name: typeName },
          })
        }
      }
    }

    return {
      TSTypeAliasDeclaration: checkZInferTypeAlias,
      FunctionDeclaration: checkFunctionLike,
      ArrowFunctionExpression: checkFunctionLike,
    }
  },
}

export default namingSuffixRule

