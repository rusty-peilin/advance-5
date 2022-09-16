import React, { useEffect, useState } from 'react'
import { Form, Grid } from 'semantic-ui-react'

import { TxButton } from './substrate-lib/components'
import {useSubstrateState} from "./substrate-lib";

import KittyCards from './KittyCards'

export default function Main (props) {

  const { api, currentAccount } = useSubstrateState()

  const [kittyCnt, setKittyCnt] = useState(0)
  const [kitties, setKitties] = useState([])
  const [viewCnt, setViewCnt] = useState(0)

  const [status, setStatus] = useState('')

  useEffect(()=>{
      let unsubscribe
      api.query.kitties.nextKittyId(newValue => {
              setKittyCnt(newValue.toNumber())
          }).then(unsub => {
              unsubscribe = unsub
          }).catch(console.error)

      return () => unsubscribe && unsubscribe()
  }, [api.query.kitties])

  useEffect(()=>{
      if(viewCnt < kittyCnt){
          api.queryMulti([
              [api.query.kitties.kitties, viewCnt],
              [api.query.kitties.kittyOwner, viewCnt]
          ], ([dna, owner])=>{
              let result = kitties.map(a=>a)
              result.push({id:viewCnt, dna:dna.unwrap(), owner:owner.unwrap().toString()})
              setKitties(result)
              setViewCnt(viewCnt+1)
          }).then(unsub => {
              // console.log(unsub)
          }).catch(console.error)
      }
  }, [viewCnt, kittyCnt])

  return <Grid.Column width={16}>
    <h1>小毛孩</h1>
    <KittyCards kitties={kitties} accountPair={currentAccount} setStatus={setStatus}/>
    <Form style={{ margin: '1em 0' }}>
      <Form.Field style={{ textAlign: 'center' }}>
        <TxButton
          label={`创建毛孩，目前共 ${kittyCnt} 只`}
          type='SIGNED-TX'
          setStatus={setStatus}
          attrs={{
            palletRpc: 'kitties',
            callable: 'create',
            inputParams: [],
            paramFields: []
          }}
        />
      </Form.Field>
      <div style={{ overflowWrap: 'break-word' }}>{status}</div>
    </Form>
  </Grid.Column>
}
